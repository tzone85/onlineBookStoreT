/**
 * Approval Mode Configuration
 * Defines the behavior for order approval processing
 */

const APPROVAL_MODES = {
    AUTO: 'auto',
    MANUAL: 'manual',
    STRICT: 'strict'
};

const DEFAULT_MODE = APPROVAL_MODES.AUTO;

/**
 * Parse approval mode from command line arguments
 * @returns {string} The approval mode value
 */
function parseApprovalMode() {
    const args = process.argv;
    const approvalModeIndex = args.findIndex(arg => arg === '--approval-mode');

    if (approvalModeIndex === -1) {
        return DEFAULT_MODE;
    }

    if (approvalModeIndex === args.length - 1) {
        throw new Error('--approval-mode requires a value');
    }

    const mode = args[approvalModeIndex + 1];

    if (!Object.values(APPROVAL_MODES).includes(mode)) {
        throw new Error(`Invalid approval mode: ${mode}. Valid options: ${Object.values(APPROVAL_MODES).join(', ')}`);
    }

    return mode;
}

/**
 * Get order behavior based on approval mode
 * @param {string} mode - The approval mode
 * @returns {Object} Order behavior configuration
 */
function getOrderBehavior(mode = DEFAULT_MODE) {
    switch (mode) {
        case APPROVAL_MODES.AUTO:
            return {
                autoComplete: true,
                requiresApproval: false,
                updateStock: true,
                initialStatus: 'completed'
            };

        case APPROVAL_MODES.MANUAL:
            return {
                autoComplete: false,
                requiresApproval: true,
                updateStock: false, // Wait for approval
                initialStatus: 'pending'
            };

        case APPROVAL_MODES.STRICT:
            return {
                autoComplete: false,
                requiresApproval: true,
                updateStock: false,
                initialStatus: 'pending',
                requireAdminApproval: true
            };

        default:
            throw new Error(`Unknown approval mode: ${mode}`);
    }
}

/**
 * Validate approval mode interactions with other flags
 * @param {string} mode - The approval mode
 * @param {Object} otherFlags - Other command line flags
 * @returns {Object} Validation result
 */
function validateModeInteractions(mode, otherFlags = {}) {
    const warnings = [];
    const errors = [];

    // If debug mode is enabled with strict mode
    if (mode === APPROVAL_MODES.STRICT && otherFlags.debug) {
        warnings.push('Debug mode with strict approval may expose sensitive information');
    }

    // If auto mode is used in production
    if (mode === APPROVAL_MODES.AUTO && process.env.NODE_ENV === 'production') {
        warnings.push('Auto approval mode in production may pose security risks');
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}

module.exports = {
    APPROVAL_MODES,
    DEFAULT_MODE,
    parseApprovalMode,
    getOrderBehavior,
    validateModeInteractions
};