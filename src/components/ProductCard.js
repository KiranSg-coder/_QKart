import { AddShoppingCartOutlined } from "@mui/icons-material";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Rating,
  Typography,
  Chip,
} from "@mui/material";
import React from "react";
import "./ProductCard.css";

const ProductCard = ({ product, handleAddToCart }) => {
  const { name, cost, rating, image, _id, discount } = product;

  return (
    <Card className="product-card">
      {/* Discount Badge */}
      {discount && (
        <Chip
          label={`${discount}% OFF`}
          className="discount-badge"
          color="error"
          size="small"
        />
      )}
      
      <div className="">
        <CardMedia
          component="img"
          image={image}
          alt={name}
          className="product-image"
        />
      </div>

      <CardContent className="card-content">
        <Typography variant="h6" className="product-title">
          {name}
        </Typography>
        <div className="price-rating">
          <Typography variant="h5" className="product-price">
            ${cost}
            {discount && (
              <span className="original-price">${(cost / (1 - discount/100)).toFixed(2)}</span>
            )}
          </Typography>
          <Rating
            value={rating}
            precision={0.5}
            readOnly
            className="rating-stars"
          />
        </div>
      </CardContent>

      <CardActions className="card-actions">
        <Button
          fullWidth
          variant="contained"
          className="add-to-cart-btn"
          onClick={handleAddToCart}
          value={_id}
          startIcon={<AddShoppingCartOutlined />}
        >
          Add to Cart
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;