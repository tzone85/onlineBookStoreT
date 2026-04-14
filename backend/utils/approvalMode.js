/**
 * Approval Mode Utility
 * Handles command line argument parsing and approval mode logic
 */

class ApprovalMode {
  constructor() {
    this.approvalMode = this.parseArguments();
  }

  /**
   * Parse command line arguments for --approval-mode
   * @returns {boolean} true if approval mode is enabled
   */
  parseArguments() {
    const args = process.argv;
    return args.includes('--approval-mode');
  }

  /**
   * Get approval mode status
   * @returns {boolean} true if approval mode is enabled
   */
  isApprovalMode() {
    return this.approvalMode;
  }

  /**
   * Get initial order status based on approval mode
   * @returns {string} 'pending' if approval mode is on, 'completed' otherwise
   */
  getInitialOrderStatus() {
    return this.approvalMode ? 'pending' : 'completed';
  }

  /**
   * Process order based on approval mode
   * @param {Object} orderData - Order data to process
   * @returns {Object} Processed order data with appropriate status
   */
  processOrder(orderData) {
    if (!orderData) {
      throw new Error('Order data is required');
    }

    return {
      ...orderData,
      status: this.getInitialOrderStatus()
    };
  }

  /**
   * Validate order for approval mode requirements
   * @param {Object} orderData - Order data to validate
   * @returns {Object} Validation result
   */
  validateOrder(orderData) {
    const errors = [];

    if (!orderData) {
      errors.push('Order data is required');
    } else {
      if (!orderData.isbn) {
        errors.push('ISBN is required');
      }
      if (!orderData.quantity || orderData.quantity <= 0) {
        errors.push('Valid quantity is required');
      }
      if (!orderData.totalPrice || orderData.totalPrice <= 0) {
        errors.push('Valid total price is required');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

module.exports = new ApprovalMode();