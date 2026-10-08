import { Request, Response } from 'express';
import { pool } from '../conf/dbConnection';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

const ValidID = (id: string) => !isNaN(Number(id)) && Number(id) > 0;
const ValidPrice = (price: unknown) => typeof price === 'number' && price > 0;

export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const [rows] = await pool.query('SELECT * FROM products WHERE active = TRUE');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al leer los productos.' });
    }
};

export const findProductWithId = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    if (!ValidID(id)) {
        res.status(400).json({ error: 'ID invalido' });
        return;
    }

    try {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM products WHERE id = ? AND active = TRUE', [id]);
        if (rows.length === 0) {
            res.status(404).json({ error: 'Producto no encontrado' });
            return;
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Error al leer el producto' });
    }
};

export const insertProduct = async (req: Request, res: Response): Promise<void> => {
    const { name, price, stock, description, brand, img } = req.body;

if (!name || !description || stock === undefined || !ValidPrice(price)) {
        res.status(400).json({ error: 'Faltan datos obligatorios' });
        return;
    }

    try {
        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO products (name, price, stock, description, brand, img) VALUES (?, ?, ?, ?, ?, ?)',
            [name, price, stock, description, brand || null, img || null]
        );
        res.status(201).json({ message: 'Producto creado', id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el producto.' });
    }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { name, price, stock, description, brand, img } = req.body;

    if (!ValidID(id)) {
        res.status(400).json({ error: 'ID invalido.' });
        return;
    }
if (!name || !description || stock === undefined || !ValidPrice(price)) {
        res.status(400).json({ error: 'Datos invalidos.' });
        return;
    }

    try {
        const [result] = await pool.query<ResultSetHeader>(
            'UPDATE products SET name = ?, price = ?, stock = ?, description = ?, brand = ?, img = ? WHERE id = ? AND active = TRUE',
            [name, price, stock, description, brand || null, img || null, id]
        );

        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Producto no encontrado' });
            return;
        }
        res.json({ message: 'Actualizacion completada' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el producto.' });
    }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    if (!ValidID(id)) {
        res.status(400).json({ error: 'ID invalido' });
        return;
    }

    try {
        const [result] = await pool.query<ResultSetHeader>(
            'UPDATE products SET active = FALSE WHERE id = ? AND active = TRUE',
            [id]
        );
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Producto no encontrado' });
            return;
        }
        res.json({ message: 'Producto dado de baja logicamente.' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el producto' });
    }
};

export const changePrice = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { price } = req.body;

    if (!ValidID(id)) {
        res.status(400).json({ error: 'ID invalido.' });
        return;
    }
if (!ValidPrice(price)) {
        res.status(400).json({ error: 'El precio debe ser un numero positivo' });
        return;
    }

    try {
        const [result] = await pool.query<ResultSetHeader>(
            'UPDATE products SET price = ? WHERE id = ? AND active = TRUE',
            [price, id]
        );
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Producto no encontrado' });
            return;
        }
        res.json({ message: 'Precio actualizado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al cambiar el precio' });
    }
};