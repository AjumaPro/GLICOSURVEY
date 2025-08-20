import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

class ReportService {
  static async generatePDFReport(analytics, survey, options = {}) {
    const {
      includeCharts = true,
      includeMetrics = true,
      includeTables = true,
      dateRange = 'all'
    } = options;

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 20;

    // Add header
    pdf.setFillColor(59, 130, 246); // Blue background
    pdf.rect(0, 0, pageWidth, 30, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.text('Survey Analytics Report', pageWidth / 2, 15, { align: 'center' });
    
    pdf.setFontSize(12);
    pdf.text(`Survey: ${survey?.title || 'Untitled Survey'}`, pageWidth / 2, 25, { align: 'center' });

    // Reset text color
    pdf.setTextColor(0, 0, 0);
    yPosition = 40;

    // Add report metadata
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Report Summary', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    const metadata = [
      `Generated: ${new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`,
      `Date Range: ${this.getDateRangeLabel(dateRange)}`,
      `Total Responses: ${analytics?.completion?.total_sessions || 0}`,
      `Completion Rate: ${analytics?.completion?.completion_rate || 0}%`,
      `Total Questions: ${survey?.questions?.length || 0}`
    ];

    metadata.forEach(item => {
      pdf.text(item, 20, yPosition);
      yPosition += 6;
    });

    yPosition += 10;

    // Add key metrics
    if (includeMetrics) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Key Performance Metrics', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');

      const metrics = [
        { label: 'Total Sessions', value: analytics?.completion?.total_sessions || 0 },
        { label: 'Completed Sessions', value: analytics?.completion?.completed_sessions || 0 },
        { label: 'Average Response Time', value: this.formatTime(analytics?.responseTimeAnalysis?.avg_time_between_questions || 0) },
        { label: 'Engagement Score', value: `${Math.round(analytics?.engagementScore?.engagement_score || 0)}%` }
      ];

      metrics.forEach(metric => {
        pdf.text(`${metric.label}: ${metric.value}`, 20, yPosition);
        yPosition += 6;
      });

      yPosition += 10;
    }

    // Add device analytics
    if (includeCharts && analytics?.deviceAnalytics) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Device Usage Distribution', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');

      analytics.deviceAnalytics.forEach(device => {
        const percentage = ((device.count / analytics.completion.total_sessions) * 100).toFixed(1);
        pdf.text(`${device.device}: ${device.count} (${percentage}%)`, 20, yPosition);
        yPosition += 6;
      });

      yPosition += 10;
    }

    // Add browser analytics
    if (includeCharts && analytics?.browserAnalytics) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Browser Distribution', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');

      analytics.browserAnalytics.forEach(browser => {
        const percentage = ((browser.count / analytics.completion.total_sessions) * 100).toFixed(1);
        pdf.text(`${browser.browser}: ${browser.count} (${percentage}%)`, 20, yPosition);
        yPosition += 6;
      });

      yPosition += 10;
    }

    // Add question performance
    if (includeTables && analytics?.questionCompletion) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Question Performance Analysis', 20, yPosition);
      yPosition += 10;

      // Create table header
      pdf.setFillColor(243, 244, 246); // Gray background
      pdf.rect(20, yPosition - 5, pageWidth - 40, 8, 'F');
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Question', 25, yPosition);
      pdf.text('Completion Rate', 120, yPosition);
      pdf.text('Responses', 180, yPosition);
      
      yPosition += 8;

      // Add table rows
      pdf.setFont('helvetica', 'normal');
      analytics.questionCompletion.forEach(question => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.text(question.question || 'Unknown', 25, yPosition);
        pdf.text(`${question.completion_rate}%`, 120, yPosition);
        pdf.text(question.responses.toString(), 180, yPosition);
        yPosition += 6;
      });

      yPosition += 10;
    }

    // Add location analytics
    if (includeCharts && analytics?.locationAnalytics) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Top Response Locations', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');

      analytics.locationAnalytics.slice(0, 10).forEach((location, index) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.text(`${index + 1}. ${location.country || 'Unknown'} - ${location.city || 'Unknown City'}`, 20, yPosition);
        pdf.text(`${location.count} responses`, 150, yPosition);
        yPosition += 6;
      });

      yPosition += 10;
    }

    // Add footer
    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      pdf.text('Generated by SurveyGuy Analytics', pageWidth / 2, pageHeight - 5, { align: 'center' });
    }

    return pdf;
  }

  static async generateCSVReport(analytics, survey) {
    let csv = 'Survey Analytics Report\n';
    csv += `Survey: ${survey?.title || 'Untitled Survey'}\n`;
    csv += `Generated: ${new Date().toLocaleDateString()}\n\n`;

    // Key metrics
    csv += 'Key Metrics\n';
    csv += 'Metric,Value\n';
    csv += `Total Responses,${analytics?.completion?.total_sessions || 0}\n`;
    csv += `Completed Sessions,${analytics?.completion?.completed_sessions || 0}\n`;
    csv += `Completion Rate,${analytics?.completion?.completion_rate || 0}%\n`;
    csv += `Average Response Time,${this.formatTime(analytics?.responseTimeAnalysis?.avg_time_between_questions || 0)}\n`;
    csv += `Engagement Score,${Math.round(analytics?.engagementScore?.engagement_score || 0)}%\n\n`;

    // Device analytics
    if (analytics?.deviceAnalytics) {
      csv += 'Device Usage\n';
      csv += 'Device,Count,Percentage\n';
      analytics.deviceAnalytics.forEach(device => {
        const percentage = ((device.count / analytics.completion.total_sessions) * 100).toFixed(1);
        csv += `${device.device},${device.count},${percentage}%\n`;
      });
      csv += '\n';
    }

    // Browser analytics
    if (analytics?.browserAnalytics) {
      csv += 'Browser Distribution\n';
      csv += 'Browser,Count,Percentage\n';
      analytics.browserAnalytics.forEach(browser => {
        const percentage = ((browser.count / analytics.completion.total_sessions) * 100).toFixed(1);
        csv += `${browser.browser},${browser.count},${percentage}%\n`;
      });
      csv += '\n';
    }

    // Question performance
    if (analytics?.questionCompletion) {
      csv += 'Question Performance\n';
      csv += 'Question,Completion Rate,Responses\n';
      analytics.questionCompletion.forEach(question => {
        csv += `"${question.question || 'Unknown'}",${question.completion_rate}%,${question.responses}\n`;
      });
      csv += '\n';
    }

    // Location analytics
    if (analytics?.locationAnalytics) {
      csv += 'Response Locations\n';
      csv += 'Country,City,Count\n';
      analytics.locationAnalytics.forEach(location => {
        csv += `${location.country || 'Unknown'},${location.city || 'Unknown City'},${location.count}\n`;
      });
    }

    return csv;
  }

  static formatTime(seconds) {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  }

  static getDateRangeLabel(range) {
    switch (range) {
      case '7d': return 'Last 7 Days';
      case '30d': return 'Last 30 Days';
      case '90d': return 'Last 90 Days';
      default: return 'All Time';
    }
  }

  static async captureDashboardAsImage(elementRef) {
    try {
      const canvas = await html2canvas(elementRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Error capturing dashboard:', error);
      throw error;
    }
  }
}

export default ReportService; 