// Export utility functions for PDF and Excel
// Note: You'll need to install: npm install jspdf jspdf-autotable xlsx

/**
 * Export report to PDF
 * @param {Object} reportData - Report data object
 * @param {String} reportType - 'daily' or 'monthly'
 * @param {String} date - Date string for daily or month string for monthly
 */
export const exportToPDF = (reportData, reportType, date) => {
  // Dynamic import to avoid issues if library not installed
  Promise.all([
    import('jspdf'),
    import('jspdf-autotable')
  ]).then(([{ default: jsPDF }, { default: autoTable }]) => {
    try {
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(18);
      doc.text('BÁO CÁO DOANH THU', 105, 20, { align: 'center' });
      
      // Report type and date
      doc.setFontSize(12);
      const reportTitle = reportType === 'daily' 
        ? `Báo cáo ngày: ${date}`
        : `Báo cáo tháng: ${date}`;
      doc.text(reportTitle, 105, 30, { align: 'center' });
      
      // Company info
      doc.setFontSize(10);
      doc.text('QUẢN LÝ QUÁN CAFE', 105, 40, { align: 'center' });
      doc.text(`Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`, 105, 45, { align: 'center' });
      
      // Summary table
      const summaryData = [
        ['Tổng số đơn hàng', reportData.totalOrders || 0],
        ['Tổng số khách', reportData.totalCustomers || 0],
        ['Tổng doanh thu', `${(reportData.totalRevenue || 0).toLocaleString('vi-VN')} ₫`],
        ['Đơn hoàn thành', reportData.completedOrders || 0],
        ['Đơn đang chờ', reportData.pendingOrders || 0],
        ['Đơn đã hủy', reportData.cancelledOrders || 0]
      ];
      
      autoTable(doc, {
        startY: 55,
        head: [['Chỉ tiêu', 'Giá trị']],
        body: summaryData,
        theme: 'striped',
        headStyles: { fillColor: [111, 78, 55] },
        styles: { fontSize: 10 }
      });
      
      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
          `Trang ${i} / ${pageCount}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }
      
      // Save PDF
      const fileName = reportType === 'daily' 
        ? `BaoCao_${date.replace(/-/g, '')}.pdf`
        : `BaoCao_Thang_${date.replace(/-/g, '')}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Có lỗi xảy ra khi xuất PDF. Vui lòng kiểm tra console để biết thêm chi tiết.');
    }
  }).catch((error) => {
    console.error('Error loading PDF libraries:', error);
    alert('Thư viện jspdf hoặc jspdf-autotable chưa được cài đặt. Vui lòng chạy: npm install jspdf jspdf-autotable');
  });
};

/**
 * Export report to Excel
 * @param {Object} reportData - Report data object
 * @param {String} reportType - 'daily' or 'monthly'
 * @param {String} date - Date string for daily or month string for monthly
 * @param {Array} orderDetails - Optional: Array of order details
 */
export const exportToExcel = (reportData, reportType, date, orderDetails = []) => {
  import('xlsx').then((XLSX) => {
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Summary sheet
    const summaryData = [
      ['BÁO CÁO DOANH THU'],
      [reportType === 'daily' ? `Báo cáo ngày: ${date}` : `Báo cáo tháng: ${date}`],
      ['Ngày xuất:', new Date().toLocaleDateString('vi-VN')],
      [],
      ['CHỈ TIÊU', 'GIÁ TRỊ'],
      ['Tổng số đơn hàng', reportData.totalOrders || 0],
      ['Tổng số khách', reportData.totalCustomers || 0],
      ['Tổng doanh thu', reportData.totalRevenue || 0],
      ['Đơn hoàn thành', reportData.completedOrders || 0],
      ['Đơn đang chờ', reportData.pendingOrders || 0],
      ['Đơn đã hủy', reportData.cancelledOrders || 0]
    ];
    
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    
    // Style summary sheet
    wsSummary['!cols'] = [
      { wch: 25 }, // Column A width
      { wch: 20 }  // Column B width
    ];
    
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Tổng hợp');
    
    // Order details sheet (if available)
    if (orderDetails && orderDetails.length > 0) {
      const orderHeaders = [['Mã đơn', 'Ngày đặt', 'Khách hàng', 'Số lượng món', 'Tổng tiền', 'Trạng thái']];
      const orderRows = orderDetails.map(order => [
        order._id || order.id,
        new Date(order.orderTime).toLocaleDateString('vi-VN'),
        order.userId?.fullName || 'N/A',
        order.items?.length || 0,
        order.totalAmount || 0,
        order.status || 'N/A'
      ]);
      
      const orderData = [...orderHeaders, ...orderRows];
      const wsOrders = XLSX.utils.aoa_to_sheet(orderData);
      
      wsOrders['!cols'] = [
        { wch: 25 }, // Mã đơn
        { wch: 15 }, // Ngày đặt
        { wch: 20 }, // Khách hàng
        { wch: 15 }, // Số lượng món
        { wch: 15 }, // Tổng tiền
        { wch: 15 }  // Trạng thái
      ];
      
      XLSX.utils.book_append_sheet(wb, wsOrders, 'Chi tiết đơn hàng');
    }
    
    // Save Excel file
      const fileName = reportType === 'daily' 
        ? `BaoCao_${date.replace(/-/g, '')}.xlsx`
        : `BaoCao_Thang_${date.replace(/-/g, '')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }).catch((error) => {
    console.error('Error exporting Excel:', error);
    alert('Thư viện xlsx chưa được cài đặt hoặc có lỗi. Vui lòng chạy: npm install xlsx');
  });
};

/**
 * Export order list to PDF
 * @param {Array} orders - Array of order objects
 * @param {String} title - Title for the report
 */
export const exportOrdersToPDF = (orders, title = 'Danh sách đơn hàng') => {
  import('jspdf').then(({ default: jsPDF }) => {
    import('jspdf-autotable').then(({ default: autoTable }) => {
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(18);
      doc.text(title.toUpperCase(), 105, 20, { align: 'center' });
      
      doc.setFontSize(10);
      doc.text(`Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`, 105, 30, { align: 'center' });
      doc.text(`Tổng số đơn: ${orders.length}`, 105, 35, { align: 'center' });
      
      // Table data
      const tableData = orders.map(order => [
        order._id?.substring(0, 8) || 'N/A',
        new Date(order.orderTime).toLocaleDateString('vi-VN'),
        order.userId?.fullName || 'N/A',
        order.items?.length || 0,
        `${(order.totalAmount || 0).toLocaleString('vi-VN')} ₫`,
        order.status || 'N/A'
      ]);
      
      autoTable(doc, {
        startY: 45,
        head: [['Mã đơn', 'Ngày đặt', 'Khách hàng', 'Số món', 'Tổng tiền', 'Trạng thái']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [111, 78, 55] },
        styles: { fontSize: 9 }
      });
      
      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
          `Trang ${i} / ${pageCount}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }
      
      doc.save(`DanhSachDonHang_${new Date().toISOString().split('T')[0]}.pdf`);
    });
  });
};

