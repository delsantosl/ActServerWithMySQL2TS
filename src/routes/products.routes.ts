import { Router } from 'express';
import { 
    getAllProducts, findProductWithId, insertProduct, 
    updateProduct, deleteProduct, changePrice 
} from '../controllers/products.controller';

const router = Router();

router.get('/', getAllProducts);
router.get('/:id', findProductWithId);
router.post('/', insertProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);
router.patch('/:id/price', changePrice);

export default router;