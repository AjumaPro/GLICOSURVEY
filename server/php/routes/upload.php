<?php
require_once __DIR__ . '/../middleware/auth.php';

function handleUploadRoutes($path, $method, $input, $authorization) {
    $subPath = str_replace('upload/', '', $path);
    
    switch ($method) {
        case 'POST':
            if (empty($subPath)) {
                return handleFileUpload($authorization);
            }
            break;
            
        case 'GET':
            if (!empty($subPath)) {
                return handleFileDownload($subPath, $authorization);
            }
            break;
            
        case 'DELETE':
            if (!empty($subPath)) {
                return handleFileDelete($subPath, $authorization);
            }
            break;
    }
    
    http_response_code(404);
    return ['error' => 'Upload endpoint not found'];
}

function handleFileUpload($authorization) {
    $user = requireAuth($authorization);
    
    // Check if file was uploaded
    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        return ['error' => 'No file uploaded or upload error'];
    }
    
    $file = $_FILES['file'];
    $fileName = $file['name'];
    $fileSize = $file['size'];
    $fileTmpName = $file['tmp_name'];
    $fileType = $file['type'];
    
    // Validate file size (10MB limit)
    $maxFileSize = 10 * 1024 * 1024; // 10MB
    if ($fileSize > $maxFileSize) {
        http_response_code(400);
        return ['error' => 'File size too large. Maximum size is 10MB'];
    }
    
    // Validate file type
    $allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (!in_array($fileType, $allowedTypes)) {
        http_response_code(400);
        return ['error' => 'File type not allowed'];
    }
    
    // Generate unique filename
    $fileExtension = pathinfo($fileName, PATHINFO_EXTENSION);
    $uniqueFileName = uniqid() . '_' . time() . '.' . $fileExtension;
    
    // Create uploads directory if it doesn't exist
    $uploadsDir = __DIR__ . '/../uploads';
    if (!is_dir($uploadsDir)) {
        mkdir($uploadsDir, 0755, true);
    }
    
    // Move uploaded file
    $uploadPath = $uploadsDir . '/' . $uniqueFileName;
    if (!move_uploaded_file($fileTmpName, $uploadPath)) {
        http_response_code(500);
        return ['error' => 'Failed to save uploaded file'];
    }
    
    // Save file record to database
    try {
        $result = query(
            'INSERT INTO uploads (filename, original_name, file_path, file_size, file_type, uploaded_by, created_at) 
             VALUES (?, ?, ?, ?, ?, ?, NOW())',
            [$uniqueFileName, $fileName, $uploadPath, $fileSize, $fileType, $user['id']]
        );
        
        return [
            'message' => 'File uploaded successfully',
            'file' => [
                'id' => $result['last_insert_id'],
                'filename' => $uniqueFileName,
                'original_name' => $fileName,
                'file_size' => $fileSize,
                'file_type' => $fileType,
                'url' => '/api/upload/' . $uniqueFileName
            ]
        ];
        
    } catch (Exception $e) {
        // Delete uploaded file if database insert fails
        unlink($uploadPath);
        http_response_code(500);
        return ['error' => 'Failed to save file record: ' . $e->getMessage()];
    }
}

function handleFileDownload($filename, $authorization) {
    $user = requireAuth($authorization);
    
    // Get file record from database
    $fileRecord = queryOne(
        'SELECT * FROM uploads WHERE filename = ? AND is_deleted = 0',
        [$filename]
    );
    
    if (!$fileRecord) {
        http_response_code(404);
        return ['error' => 'File not found'];
    }
    
    // Check permissions
    if ($user['role'] === 'user' && $fileRecord['uploaded_by'] != $user['id']) {
        http_response_code(403);
        return ['error' => 'Access denied'];
    }
    
    $filePath = $fileRecord['file_path'];
    
    // Check if file exists on disk
    if (!file_exists($filePath)) {
        http_response_code(404);
        return ['error' => 'File not found on disk'];
    }
    
    // Set headers for file download
    header('Content-Type: ' . $fileRecord['file_type']);
    header('Content-Disposition: inline; filename="' . $fileRecord['original_name'] . '"');
    header('Content-Length: ' . $fileRecord['file_size']);
    header('Cache-Control: public, max-age=31536000');
    
    // Output file content
    readfile($filePath);
    exit();
}

function handleFileDelete($filename, $authorization) {
    $user = requireAuth($authorization);
    
    // Get file record from database
    $fileRecord = queryOne(
        'SELECT * FROM uploads WHERE filename = ? AND is_deleted = 0',
        [$filename]
    );
    
    if (!$fileRecord) {
        http_response_code(404);
        return ['error' => 'File not found'];
    }
    
    // Check permissions
    if ($user['role'] === 'user' && $fileRecord['uploaded_by'] != $user['id']) {
        http_response_code(403);
        return ['error' => 'Access denied'];
    }
    
    try {
        // Soft delete file record
        query(
            'UPDATE uploads SET is_deleted = 1, updated_at = NOW() WHERE id = ?',
            [$fileRecord['id']]
        );
        
        // Optionally delete physical file (uncomment if you want to delete files from disk)
        // $filePath = $fileRecord['file_path'];
        // if (file_exists($filePath)) {
        //     unlink($filePath);
        // }
        
        return ['message' => 'File deleted successfully'];
        
    } catch (Exception $e) {
        http_response_code(500);
        return ['error' => 'Failed to delete file: ' . $e->getMessage()];
    }
}

// Handle CSV import for questions
function handleCSVImport($csvFile, $surveyId, $authorization) {
    $user = requireAuth($authorization);
    
    // Check if survey exists and user has permission
    $survey = queryOne(
        'SELECT created_by FROM surveys WHERE id = ? AND is_deleted = 0',
        [$surveyId]
    );
    
    if (!$survey) {
        throw new Exception('Survey not found');
    }
    
    if ($user['role'] === 'user' && $survey['created_by'] != $user['id']) {
        throw new Exception('Access denied');
    }
    
    // Read CSV file
    $handle = fopen($csvFile, 'r');
    if (!$handle) {
        throw new Exception('Failed to open CSV file');
    }
    
    $questions = [];
    $row = 0;
    
    while (($data = fgetcsv($handle)) !== false) {
        $row++;
        
        // Skip header row
        if ($row === 1) {
            continue;
        }
        
        // Validate required columns
        if (count($data) < 3) {
            continue; // Skip invalid rows
        }
        
        $questionType = trim($data[0]);
        $questionTitle = trim($data[1]);
        $questionOptions = trim($data[2]);
        $required = isset($data[3]) ? (trim($data[3]) === 'true' ? 1 : 0) : 0;
        
        if (empty($questionTitle)) {
            continue; // Skip questions without title
        }
        
        $options = null;
        if (!empty($questionOptions) && in_array($questionType, ['multiple_choice', 'emoji_scale', 'likert_scale'])) {
            $options = explode('|', $questionOptions);
            $options = array_map('trim', $options);
            $options = array_filter($options); // Remove empty options
        }
        
        $questions[] = [
            'type' => $questionType,
            'title' => $questionTitle,
            'options' => $options,
            'required' => $required
        ];
    }
    
    fclose($handle);
    
    if (empty($questions)) {
        throw new Exception('No valid questions found in CSV');
    }
    
    // Insert questions into database
    try {
        transaction(function() use ($surveyId, $questions) {
            foreach ($questions as $index => $question) {
                $options = isset($question['options']) ? json_encode($question['options']) : null;
                
                query(
                    'INSERT INTO questions (survey_id, type, title, options, required, order_index, created_at) 
                     VALUES (?, ?, ?, ?, ?, ?, NOW())',
                    [
                        $surveyId,
                        $question['type'],
                        $question['title'],
                        $options,
                        $question['required'],
                        $index + 1
                    ]
                );
            }
        });
        
        return [
            'message' => 'CSV import completed successfully',
            'questions_imported' => count($questions)
        ];
        
    } catch (Exception $e) {
        throw new Exception('Failed to import questions: ' . $e->getMessage());
    }
}
?>
