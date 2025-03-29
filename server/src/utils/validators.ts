import { check, ValidationChain } from 'express-validator';
import { constants } from '../config/constants';

/**
 * Validation rules for user registration
 */
export const registerValidation: ValidationChain[] = [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  check('walletId', 'Hedera wallet ID is required').optional()
];

/**
 * Validation rules for user login
 */
export const loginValidation: ValidationChain[] = [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
];

/**
 * Validation rules for project creation
 */
export const projectValidation: ValidationChain[] = [
  check('name', 'Project name is required').not().isEmpty(),
  check('description', 'Description is required').not().isEmpty(),
  check('location', 'Location is required').not().isEmpty(),
  check('area', 'Area must be a positive number').isNumeric().custom((value) => value > 0),
  check('estimatedCarbonCapture', 'Estimated carbon capture must be a positive number')
    .isNumeric().custom((value) => value > 0),
  check('startDate', 'Start date is required').isISO8601(),
  check('endDate', 'End date is required').isISO8601(),
  check('projectType', 'Project type is required').not().isEmpty()
];

/**
 * Validation rules for token creation
 */
export const tokenValidation: ValidationChain[] = [
  check('projectId', 'Project ID is required').not().isEmpty(),
  check('initialSupply', 'Initial supply must be a positive number')
    .isNumeric().custom((value) => value > 0),
  check('tokenName', 'Token name is required').not().isEmpty(),
  check('tokenSymbol', 'Token symbol is required').not().isEmpty(),
  check('decimals', 'Decimals must be a positive number')
    .isNumeric().custom((value) => value >= 0 && value <= 18)
];

/**
 * Validation rules for token transfer
 */
export const transferValidation: ValidationChain[] = [
  check('tokenId', 'Token ID is required').not().isEmpty(),
  check('receiverId', 'Receiver ID is required').not().isEmpty(),
  check('amount', 'Amount must be a positive number')
    .isNumeric().custom((value) => value > 0)
];

/**
 * Validation rules for creating a marketplace listing
 */
export const listingValidation: ValidationChain[] = [
  check('tokenId', 'Token ID is required').not().isEmpty(),
  check('amount', 'Amount must be a positive number')
    .isNumeric().custom((value) => value > 0),
  check('price', 'Price must be a positive number')
    .isNumeric().custom((value) => value > 0),
  check('expirationDate', 'Expiration date is required').isISO8601()
];

/**
 * Validation rules for executing a purchase
 */
export const purchaseValidation: ValidationChain[] = [
  check('listingId', 'Listing ID is required').not().isEmpty(),
  check('amount', 'Amount must be a positive number')
    .isNumeric().custom((value) => value > 0)
];

/**
 * Validation rules for starting verification
 */
export const verificationStartValidation: ValidationChain[] = [
  check('projectId', 'Project ID is required').not().isEmpty(),
  check('verificationType', 'Verification type is required').not().isEmpty()
];

/**
 * Validation rules for submitting verification data
 */
export const verificationSubmitValidation: ValidationChain[] = [
  check('data', 'Verification data is required').not().isEmpty(),
  check('evidence', 'Evidence is required').not().isEmpty()
];

/**
 * Validation rules for updating verification status
 */
export const verificationStatusValidation: ValidationChain[] = [
  check('status', 'Status is required')
    .isIn(Object.values(constants.VERIFICATION_STATUS)),
  check('notes', 'Notes are required when rejecting a verification')
    .custom((notes, { req }) => {
      if (req.body.status === constants.VERIFICATION_STATUS.REJECTED && !notes) {
        throw new Error('Notes are required when rejecting a verification');
      }
      return true;
    })
];