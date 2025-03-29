import { Router } from 'express';
import { marketplaceController } from '../controllers/marketplaceController';
import { auth } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { listingValidation, purchaseValidation } from '../utils/validators';

const router = Router();

// Create a new listing
router.post('/listings', auth, validate(listingValidation), marketplaceController.createListing);

// Get all listings
router.get('/listings', marketplaceController.getListings);

// Get my listings
router.get('/listings/me', auth, marketplaceController.getMyListings);

// Execute a purchase
router.post('/purchase', auth, validate(purchaseValidation), marketplaceController.executePurchase);

// Cancel a listing
router.delete('/listings/:listingId', auth, marketplaceController.cancelListing);

// Get transaction history
router.get('/transactions', auth, marketplaceController.getTransactionHistory);

// Get market summary
router.get('/summary', marketplaceController.getMarketSummary);

// Get price history for a token
router.get('/price-history/:tokenId', marketplaceController.getPriceHistory);

// Get price recommendation
router.get('/price-recommendation/:projectId', auth, marketplaceController.getPriceRecommendation);

export default router;