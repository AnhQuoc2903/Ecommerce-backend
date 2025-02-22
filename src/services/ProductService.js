const Product = require("../models/ProductModel");
const bcrypt = require("bcryptjs");

const createProduct = (newProduct) => {
  return new Promise(async (resolve, reject) => {
    const { name, images, type, price, countInStock, rating, description } =
      newProduct;

    try {
      const checkProduct = await Product.findOne({
        name: name,
      });
      if (checkProduct !== null) {
        resolve({
          status: "ERR",
          message: "The name of product is already",
        });
      }
      const newProduct = await Product.create({
        name,
        images,
        type,
        price,
        countInStock,
        rating,
        description,
      });
      if (newProduct) {
        resolve({
          status: "OK",
          message: "Success",
          data: newProduct,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

const updateProduct = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkProduct = await Product.findOne({
        _id: id,
      });
      if (checkProduct === null) {
        resolve({
          status: "ERR",
          message: "The product is not defined",
        });
      }
      const updatedProduct = await Product.findByIdAndUpdate(id, data, {
        new: true,
      });
      resolve({
        status: "OK",
        message: "Success",
        data: updatedProduct,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const deleteProduct = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkProduct = await Product.findOne({
        _id: id,
      });
      if (checkProduct === null) {
        resolve({
          status: "ERR",
          message: "The product is not defined",
        });
      }
      await Product.findByIdAndDelete(id);
      resolve({
        status: "OK",
        message: "Delete product Success",
      });
    } catch (e) {
      reject(e);
    }
  });
};

const deleteManyProduct = (ids) => {
  return new Promise(async (resolve, reject) => {
    try {
      await Product.deleteMany({ _id: ids });
      resolve({
        status: "OK",
        message: "Delete product Success",
      });
    } catch (e) {
      reject(e);
    }
  });
};

const getDetailsProduct = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const product = await Product.findOne({
        _id: id,
      });
      if (product === null) {
        resolve({
          status: "OK",
          message: "The product is not defined",
        });
      }
      resolve({
        status: "OK",
        message: "Success",
        data: product,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const getAllProduct = async (limit, page = 0, sort, filter) => {
  try {
    let query = Product.find();

    if (filter) {
      const label = filter[0];
      const value = filter[1]?.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query = query.find({ [label]: { $regex: new RegExp(value, "i") } });
    }

    const totalProduct = await Product.countDocuments(query.getFilter());

    if (sort) {
      const objectSort = { [sort[1]]: sort[0] };
      query = query.sort(objectSort);
    }

    const allProducts = await query
      .limit(Number(limit))
      .skip(Number(page) * Number(limit))
      .lean();

    return {
      status: "OK",
      message: "Success",
      data: allProducts,
      total: totalProduct,
      pageCurrent: Number(page) + 1,
      totalPage: Math.ceil(totalProduct / limit),
    };
  } catch (e) {
    console.error("Error in getAllProduct:", e.message);
    throw e;
  }
};

const getAllType = async () => {
  try {
    const allType = await Product.distinct("type");
    return {
      status: "OK",
      message: "Success",
      data: allType,
    };
  } catch (e) {
    throw e;
  }
};

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  getDetailsProduct,
  getAllProduct,
  deleteManyProduct,
  getAllType,
};
