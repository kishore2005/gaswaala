import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { AppBar, Toolbar, IconButton, Typography, Menu, MenuItem, Button, CircularProgress, Card, CardContent, CardMedia, Grid, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, RadioGroup, FormControlLabel, Radio, FormControl, FormLabel, Snackbar } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useLocation, useNavigate } from 'react-router-dom';
import anime from 'animejs/lib/anime.es.js';
import './Products.css';

function Products() {
  const [products, setProducts] = useState([]);
  const [cartProducts, setCartProducts] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const [anchorEl, setAnchorEl] = useState(null);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [showNewConnection, setShowNewConnection] = useState(false);
  const [showAccessories, setShowAccessories] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false); // Add booking loading state
  const location = useLocation();
  const navigate = useNavigate();
  const userData = location.state?.userData || JSON.parse(localStorage.getItem('userData'));

  const fetchProducts = useCallback(async () => {
    setLoading(true); // Set loading to true before fetching products
    try {
      const response = await axios.get('https://vercel-fastapi-rouge.vercel.app/products');
      if (showAllProducts) {
        setProducts(response.data);
      } else {
        const selectedProduct = response.data.filter(product => product.name.toLowerCase() === userData.gas_name.toLowerCase());
        setProducts(selectedProduct);
      }
      setLoading(false); // Set loading to false after products are fetched
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false); // Set loading to false even if there's an error
    }
  }, [showAllProducts, userData]);

  const fetchNewConnectionProducts = useCallback(async () => {
    setLoading(true); // Set loading to true before fetching products
    try {
      const response = await axios.get('https://vercel-fastapi-rouge.vercel.app/newconnection');
      setProducts(response.data);
      setLoading(false); // Set loading to false after products are fetched
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false); // Set loading to false even if there's an error
    }
  }, []);

  const fetchAccessoriesProducts = useCallback(async () => {
    setLoading(true); // Set loading to true before fetching products
    try {
      const response = await axios.get('https://vercel-fastapi-rouge.vercel.app/accessories');
      setProducts(response.data);
      setLoading(false); // Set loading to false after products are fetched
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false); // Set loading to false even if there's an error
    }
  }, []);

  useEffect(() => {
    if (!userData) {
      navigate('/signin'); // Redirect to sign-in if userData is not available
    } else {
      console.log("User data:", userData); // Log the user data
      if (showNewConnection) {
        fetchNewConnectionProducts();
      } else if (showAccessories) {
        fetchAccessoriesProducts();
      } else {
        fetchProducts();
      }
    }
  }, [userData, navigate, showAllProducts, showNewConnection, showAccessories, fetchProducts, fetchNewConnectionProducts, fetchAccessoriesProducts]);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCartProducts(storedCart);
  }, []);

  const handleBooking = async (product) => {
    setSelectedProduct(product);
    setDialogOpen(true);
  };

  const handleConfirmBooking = async () => {
    const bookingData = {
      username: userData.username,
      name: userData.name,
      mobile_number: userData.mobile_number,
      address: userData.address,
      gas_name: userData.gas_name,
      alternate_mobile_number: userData.alternate_mobile_number,
      GasTheySelected: selectedProduct.name,
      booking_datetime: new Date().toLocaleString(), // Capture local date and time
      geolocation: null,
      payment_method: paymentMethod
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        bookingData.geolocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        try {
          console.log("Booking data being sent:", bookingData); // Log the booking data
          const response = await axios.post('https://vercel-fastapi-rouge.vercel.app/book', bookingData);
          setSnackbarMessage('Booking created successfully!');
          setSnackbarOpen(true);
          navigate('/order', { state: { userData } }); // Navigate to order page
        } catch (error) {
          console.error('Error creating booking:', error);
          alert('Error creating booking');
        }
      }, (error) => {
        console.error('Error getting geolocation:', error);
        alert('Error getting geolocation');
      });
    } else {
      alert('Geolocation is not supported by this browser.');
    }
    setDialogOpen(false);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleAddToCart = (product) => {
    const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
    const updatedCart = [...storedCart, product];
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    setCartProducts(updatedCart);
    console.log("Product added to cart:", product);
    setSnackbarMessage('Product added to cart successfully!');
    setSnackbarOpen(true); // Show success message
  };

  const handleRemoveFromCart = (productId) => {
    const updatedCart = cartProducts.filter(product => product.id !== productId);
    setCartProducts(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavigateToOrders = () => {
    navigate('/order', { state: { userData } });
    handleMenuClose();
  };

  const handleNavigateToAccessories = () => {
    setShowAccessories(true);
    setShowNewConnection(false);
    setShowAllProducts(false);
    setShowCart(false);
    handleMenuClose();
  };

  const handleNavigateToNewconnection = () => {
    setShowNewConnection(true);
    setShowAccessories(false);
    setShowAllProducts(false);
    setShowCart(false);
    fetchNewConnectionProducts(); // Call the function to fetch new connection products
    handleMenuClose();
  };

  const handleShowAllProducts = () => {
    setShowAllProducts(true);
    setShowNewConnection(false);
    setShowAccessories(false);
    setShowCart(false);
  };

  const handleShowMyGas = () => {
    setShowAllProducts(false);
    setShowNewConnection(false);
    setShowAccessories(false);
    setShowCart(false);
    fetchProducts(); // Call the function to fetch user's gas products
  };

  const handleShowCart = () => {
    setShowCart(true);
    setShowAllProducts(false);
    setShowNewConnection(false);
    setShowAccessories(false);
  };

  const handleBookAll = async () => {
    setBookingLoading(true); // Set booking loading to true
    let allBooked = true;
    for (const product of cartProducts) {
      const bookingData = {
        username: userData.username,
        name: userData.name,
        mobile_number: userData.mobile_number,
        address: userData.address,
        gas_name: userData.gas_name,
        alternate_mobile_number: userData.alternate_mobile_number,
        GasTheySelected: product.name,
        booking_datetime: new Date().toLocaleString(), // Capture local date and time
        geolocation: null,
        payment_method: paymentMethod
      };

      if (navigator.geolocation) {
        await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(async (position) => {
            bookingData.geolocation = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            };
            try {
              console.log("Booking data being sent:", bookingData); // Log the booking data
              const response = await axios.post('https://vercel-fastapi-rouge.vercel.app/book', bookingData);
              resolve(response.data);
            } catch (error) {
              console.error('Error creating booking:', error);
              allBooked = false;
              reject(error);
            }
          }, (error) => {
            console.error('Error getting geolocation:', error);
            allBooked = false;
            reject(error);
          });
        });
      } else {
        alert('Geolocation is not supported by this browser.');
        allBooked = false;
        break;
      }
    }

    setBookingLoading(false); // Set booking loading to false

    if (allBooked) {
      setSnackbarMessage('All products booked successfully!');
      setSnackbarOpen(true);
      setCartProducts([]);
      localStorage.removeItem('cart');
      navigate('/order', { state: { userData } }); // Navigate to order page
    } else {
      alert('Error booking some products.');
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  useEffect(() => {
    const buttons = document.querySelectorAll('.bottom-navbar button:not(.float)');
    // Remove the unused container variable
    let y = 0;
    let moveY = 0;
    let open = false;
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    setTimeout(function () {
      window.scrollTo(0, 1);
    }, 0);
    window.addEventListener('touchstart', (evt) => {
      const area = window.innerHeight - evt.touches[0].clientY;
      y = area;
      console.log(y);
    });
    window.addEventListener('touchend', (evt) => {
      y = 0;
      console.log(moveY);
      if (moveY > (window.innerHeight / 4)) {
        anime({
          targets: '.container',
          translateY: `-${window.innerHeight / 2}px`,
          duration: 600,
        });
        open = true;
      } else {
        anime({
          targets: '.container',
          translateY: `0px`,
          duration: 600,
          easing: 'easeOutExpo'
        });
        open = false;
      }
    });
    window.addEventListener('touchmove', (evt) => {
      moveY = (window.innerHeight - y) - evt.touches[0].clientY;
      console.log(y);
      if (!open) {
        anime({
          targets: '.container',
          translateY: `${moveY <= window.innerHeight / 2 ? moveY > 0 ? -moveY : 0 : -window.innerHeight / 2}px`,
          duration: 200,
        });
      } else if (open) {
        moveY = moveY + window.innerHeight / 2;
        anime({
          targets: '.container',
          translateY: `${moveY <= window.innerHeight / 2 ? moveY > 0 ? -moveY : 0 : -window.innerHeight / 2}px`,
          duration: 200,
        });
      }
    });
    buttons.forEach((item) => {
      item.addEventListener('click', (evt) => {
        const x = evt.target.offsetLeft;
        buttons.forEach((btn) => { btn.classList.remove('active'); });
        evt.target.classList.add('active');
        anime({
          targets: '.effect',
          left: `${x}px`,
          duration: 600,
        });
      });
    });
  }, []);

  if (!userData) {
    return null; // Render nothing if userData is not available
  }

  return (
    <div className="products">
      <AppBar position="static" style={{ background: 'transparent', boxShadow: 'none' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleMenuOpen}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            GAS WALA
          </Typography>
        </Toolbar>
      </AppBar>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleNavigateToOrders}>My Orders</MenuItem>
        <MenuItem onClick={handleNavigateToAccessories}>Accessories</MenuItem>
        <MenuItem onClick={handleNavigateToNewconnection}>New Connection</MenuItem>
      </Menu>
      {loading ? (
        <div className="loading-container">
          <CircularProgress />
        </div>
      ) : showCart ? (
        <Container>
          <Typography variant="h4" gutterBottom>
            My Cart
          </Typography>
          {cartProducts.length === 0 ? (
            <Typography variant="h6">Your cart is empty</Typography>
          ) : (
            <>
              <Grid container spacing={3}>
                {cartProducts.map((product) => (
                  <Grid item xs={12} sm={6} md={4} key={product.id}>
                    <Card>
                      <CardMedia
                        component="img"
                        height="140"
                        image={product.image}
                        alt={product.name}
                      />
                      <CardContent>
                        <Typography variant="h5" component="div">
                          {product.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ₹{product.price}
                        </Typography>
                        <Button variant="contained" color="secondary" onClick={() => handleRemoveFromCart(product.id)}>
                          Remove
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              <Button variant="contained" color="primary" onClick={handleBookAll} style={{ marginTop: '20px' }}>
                {bookingLoading ? <CircularProgress size={24} /> : 'Book All'}
              </Button>
            </>
          )}
          <Button variant="contained" color="primary" onClick={() => setShowCart(false)} style={{ marginTop: '20px' }}>
            Back to Products
          </Button>
        </Container>
      ) : (
        <>
          <Typography variant="h4" gutterBottom>
            Products
          </Typography>
          {products.map((product) => (
            <div className="product" key={product.id}>
              <img src={product.image} alt={product.name} />
              <h1>{product.name}</h1>
              <div className="price">₹{product.price}</div>
              <div className="button-group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Button variant="contained" className="booking-button" onClick={() => handleBooking(product)} style={{ fontSize: '0.875rem', padding: '8px 16px', width: '100%', maxWidth: '300px', margin: '10px 0' }}>
                  Book Now
                </Button>
                <Button variant="contained" className="booking-button" onClick={() => handleAddToCart(product)} style={{ fontSize: '0.875rem', padding: '8px 16px', width: '100%', maxWidth: '300px', margin: '10px 0' }}>
                  Add to Cart
                </Button>
              </div>
            </div>
          ))}
        </>
      )}
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Select Payment Method</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please select your preferred payment method for booking {selectedProduct?.name}.
          </DialogContentText>
          <FormControl component="fieldset">
            <FormLabel component="legend">Payment Method</FormLabel>
            <RadioGroup
              aria-label="payment-method"
              name="payment-method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <FormControlLabel value="Cash" control={<Radio />} label="Cash" />
              <FormControlLabel value="UPI" control={<Radio />} label="UPI (PhonePe, GPay, Paytm)" />
              <FormControlLabel value="Card" control={<Radio />} label="Card (Visa, Master, Rupay)" />
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="secondary" variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleConfirmBooking} color="primary" variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
      <div className="button-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <button className="modern-button fancy-button" onClick={handleNavigateToAccessories}>Accessories</button>
        <button className="modern-button fancy-button" onClick={handleNavigateToNewconnection}>New Connection</button>
        <button className="modern-button fancy-button" onClick={handleShowAllProducts}>Show All Products</button>
        <button className="modern-button fancy-button" onClick={handleShowMyGas}>My Gas</button>
        <button className="modern-button fancy-button" onClick={handleShowCart}>Show Cart</button>
        <button className="modern-button fancy-button" onClick={handleNavigateToOrders}>Orders</button>
      </div>
      <footer className="footer">
        <p>POWERED BY KISHORE STORES <a href="tel:9894073441">MOBILE NUMBER: 9894073441</a></p>
      </footer>
    </div>
  );
}

export default Products;
