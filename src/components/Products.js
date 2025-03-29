import { Search, SentimentDissatisfied } from "@mui/icons-material";
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
  MenuItem,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import ProductCard from "./ProductCard";
import Cart from "./Cart";
import { generateCartItemsFrom } from "./Cart";
import "./Products.css";

const Products = () => {
  // Original products list fetched from API
  const [productDetails, setProductDetails] = useState([]);

  //filtered list after user tried to search somthing by product category/name.
  const [filteredProduct, setFilteredProduct] = useState([]);

  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("");

  //timer for debounce search
  const [debounceTime, setDebounceTime] = useState(0);

  //  Loading Animation
  const [isLoading, setIsLoading] = useState(false);

  // cart items for a user
  const [cartItem, setCartItem] = useState([]);

  //to call FetchCart fucntion in useEffect when "", henec use the below state in dependency array:
  const [cartLoad, setcartLoad] = useState(false);

  // to use snackbar
  const { enqueueSnackbar } = useSnackbar();
  let token = localStorage.getItem("token");
  let username = localStorage.getItem("username");

  //dummy data for use
  let product = {
    name: "Tan Leatherette Weekender Duffle",
    category: "Fashion",
    cost: 150,
    rating: 4,
    image:
      "https://crio-directus-assets.s3.ap-south-1.amazonaws.com/ff071a1c-1099-48f9-9b03-f858ccc53832.png",
    _id: "PmInA797xJhMIPti",
  };

  const performAPICall = async () => {
    setIsLoading(true);
    try {
      let response = await axios.get(`${config.endpoint}/products`);

      // console.log(response.data);

      setProductDetails(response.data);
      setFilteredProduct(response.data);
      // console.log({productDetails});
      // Fetch cartItems
      setcartLoad(true);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        enqueueSnackbar(error.response.data.message, { variant: "error" });
      }
    }
    //End loading
    setIsLoading(false);
    // return productDetails;
  };

  // //intial api call to populate the products on product page
  useEffect(() => {
    performAPICall();
  }, []);

  // //get req to fetch cart items for a logged in user
  useEffect(() => {
    fetchCart(token);
  }, [cartLoad]);

  const performSearch = async (text) => {
    setIsLoading(true);
    try {
      // console.log(text);
      let response = await axios.get(
        `${config.endpoint}/products/search?value=${text}`
      );

      setFilteredProduct(response.data);
    } catch (error) {
      if (error.response) {
        //if product not found, show nothing
        if (error.response.status === 404) {
          setFilteredProduct([]);
          //now since (filteredProduct.length) is zero, hence only no product found will be there :(
        }

        //if server side error, then show full product list
        if (error.response.status === 500) {
          enqueueSnackbar(error.response.data.message, { variant: "error" });
          setFilteredProduct(productDetails);
        }
      } else {
        enqueueSnackbar(
          "Something went wrong. Check that the backend is running, reachable and returns valid JSON.",
          { variant: "error" }
        );
      }
    }
    setIsLoading(false);
  };

  const debounceSearch = (event, debounceTimeId) => {
    //stored the entered keyword by user

    var text = event.target.value;
    // console.log("text :");
    // console.log(text);

    //debounce logic
    if (debounceTimeId) {
      clearTimeout(debounceTimeId);
    }

    const newTimeOut = setTimeout(() => {
      performSearch(text);
    }, 500);

    setDebounceTime(newTimeOut);
  };

  useEffect(() => {
    let filtered = productDetails;

    // Filter by search text (product name or category)
    if (searchText) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchText.toLowerCase()) ||
          product.category.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    // Filter by selected category
    if (selectedCategory) {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory
      );
    }

    if (sortBy === "PRICE_HIGH_TO_LOW") {
      filtered = filtered.sort((a, b) => b.cost - a.cost);
    } else if (sortBy === "PRICE_LOW_TO_HIGH") {
      filtered = filtered.sort((a, b) => a.cost - b.cost);
    } else if (sortBy === "RATING") {
      filtered = filtered.sort((a, b) => b.rating - a.rating);
    }
    setFilteredProduct(filtered);
  }, [searchText, selectedCategory, sortBy, productDetails]);

  // helper: unique categories from fetched products
  const uniqueCategories = [
    ...new Set(productDetails.map((product) => product.category)),
  ];

  const fetchCart = async (token) => {
    if (!token) return;
    try {
      let response = await axios.get(`${config.endpoint}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        //Update cartItems
        console.log("response :", response);

        // return response.data;
        // console.log('fetchCart: generateCartItemsFrom ',generateCartItemsFrom(response.data,productDetails));
        setCartItem(generateCartItemsFrom(response.data, productDetails));
        // console.log("CartItem :",cartItem);
      }
    } catch (e) {
      if (e.response && e.response.status === 400) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
      return null;
    }
  };

  const isItemInCart = (items, productId) => {
    for (let i = 0; i < items.length; i++) {
      if (items[i].productId === productId) {
        return true;
      }
    }
    return false;
  };

  const addToCart = async (
    token,
    items,
    products,
    productId,
    qty = 1,
    options = { preventDuplicate: false }
  ) => {
    //check if user is logged in

    if (token) {
      //now check if item is already in the cart or
      if (isItemInCart(items, productId)) {
        enqueueSnackbar(
          "Item already in cart. Use the cart sidebar to update quantity or remove item.",
          {
            variant: "error",
          }
        );
      } else {
        //make post req with product id and qty
        addInCart(productId, qty);
      }
    } else {
      //
      enqueueSnackbar("Login to add an item to the Cart", {
        variant: "error",
      });
    }
  };

  //helper function for addToCart (addition to the cart logic here)
  const addInCart = async (productId, qty) => {
    // console.log("qty passed in addInCart:",qty);
    try {
      let response = await axios.post(
        `${config.endpoint}/cart`,
        {
          productId: productId,
          qty: qty,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      //update the cart items again
      setCartItem(generateCartItemsFrom(response.data, productDetails));
    } catch (e) {
      if (e.response && e.response.status === 400) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
      return null;
    }
  };

  //another helper function to be passed as a prop to ProductCard, and we are taking productId form travesing filteredItems array.
  let handleCart = (productId) => {
    addToCart(
      token,
      cartItem,
      productDetails,
      productId
      // 1
    );
  };

  //helper function to handle the quantity of products ie + and - buttons will use this function(to add or remove quantity) and ultimately this function will call addInCart
  const handleQuantity = (productId, qty) => {
    // console.log("productId and qty in handleQuantity: "+productId+" "+qty);
    addInCart(productId, qty);
  };
  return (
    <div>
      <Header>
        <TextField
          className="search-desktop"
          size="small"
          fullWidth
          sx={{ m: 1, width: "50ch" }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Search color="primary" />
              </InputAdornment>
            ),
          }}
          placeholder="Search for items/categories"
          name="search"
          // value={searchValue} ,since passing event from here, hence on need to give value
          //here debounceTime is a state we have declared
          onChange={(e) => debounceSearch(e, debounceTime)}
        />
      </Header>

      <TextField
        className="search-mobile"
        size="small"
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
        onChange={(e) => debounceSearch(e, debounceTime)}
      />

      <Box className="filter-container" my={2} px={2}>
        <Grid container spacing={1} alignItems="center">
          {/* Category Filter */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              size="small"
              fullWidth
              select
              variant="outlined"
              label="Category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {uniqueCategories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          {/* Sort By Filter */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              size="small"
              fullWidth
              select
              variant="outlined"
              label="Sort By"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <MenuItem value="">None</MenuItem>
              <MenuItem value="PRICE_HIGH_TO_LOW">
                Price (highest first)
              </MenuItem>
              <MenuItem value="PRICE_LOW_TO_HIGH">
                Price (lowest first)
              </MenuItem>
              <MenuItem value="RATING">Ratings</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Box>

      {/* here our main container grid starts */}
      <Grid container>
        {/* first item in main grid */}
        <Grid
          item
          container
          direction="row"
          justifyContent="center"
          alignItems="center"
          xs
          md
          // OR: md={token && productDetails.length>0 ? 9 : 12}
        >
          <Grid item className="product-grid">
            <Box className="hero">
              <p className="hero-heading">
                India’s <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
                to your door step
              </p>
            </Box>
          </Grid>
          {/* used a loading condition here to show loading during api call else show products */}
          {isLoading ? (
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              sx={{ margin: "auto" }}
              py={10}
            >
              <CircularProgress size={30} />
              <h4> Loading Products... </h4>
            </Box>
          ) : (
            <Grid
              container
              item
              spacing={2}
              direction="row"
              justifyContent="center"
              alignItems="center"
              my={3}
            >
              {filteredProduct.length ? (
                filteredProduct.map((product) => (
                  <Grid item key={product["_id"]} xs={6} md={3}>
                    <ProductCard
                      product={product}
                      //taking _id from above
                      handleAddToCart={(event) => handleCart(product["_id"])}
                    />
                  </Grid>
                ))
              ) : (
                <Box
                  display="flex"
                  flexDirection="column"
                  justifyContent="center"
                  alignItems="center"
                  py={10}
                  sx={{ margin: "auto" }}
                >
                  <SentimentDissatisfied size={40} />
                  <h4>No products found</h4>
                </Box>
              )}
            </Grid>
          )}
        </Grid>
        {username && (
          <Grid
            container
            item
            xs={12}
            md={3} //bcz after log out we want our main grid to take whole width
            style={{ backgroundColor: "#E9F5E1", height: "100vh" }}
            justifyContent="center"
            alignItems="stretch"
          >
            {/* cart component */}
            <Cart
              products={productDetails}
              items={cartItem}
              handleQuantity={handleQuantity}
            />
          </Grid>
        )}
      </Grid>

      <Footer />
    </div>
  );
};

export default Products;
