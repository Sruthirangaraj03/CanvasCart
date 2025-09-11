const Product = require("../models/product");

// GET all products
// supports: ?search=abc&category=xyz&minPrice=100&maxPrice=5000
exports.getAllProducts = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, artType } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (category) query.category = category;
    if (artType) query.artType = artType;

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(query);
    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products" });
  }
};

//GET all products by id
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch product", error: error.message });
  }
};

// POST add a new product
exports.addProduct = async (req, res) => {
  try {
    const { title, description, image, price, category } = req.body;

    const newProduct = new Product({
      title,
      description,
      image,
      price,
      category
    });

    await newProduct.save();
    res.status(201).json({ message: "Product added", product: newProduct });
  } catch (error) {
    res.status(500).json({ message: "Failed to add product", error: error.message });
  }
};
//UPDATE product

exports.updateProduct = async (req, res) => {
  try {
    const { title, description, image, price, category } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.title = title || product.title;
    product.description = description || product.description;
    product.image = image || product.image;
    product.price = price || product.price;
    product.category = category || product.category;

    await product.save();
    res.status(200).json({ message: "Product updated", product });
  } catch (error) {
    res.status(500).json({ message: "Failed to update product", error: error.message });
  }
};


// 🗑️ DELETE product
exports.deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete product", error: error.message });
  }
};

