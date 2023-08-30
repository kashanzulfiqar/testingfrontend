import React from 'react';
import { AppBar, Toolbar, Button, Container, IconButton, Typography } from '@mui/material';
// import { Link } from 'react-router-dom';
import { Link } from 'react-scroll';
// import Frame from "./Frame.png"
import DaftarProLogo from './assets/DaftarProLogo.svg';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const nav = useNavigate();
  return (
    <AppBar
      position="fixed"
      style={{
        backgroundColor: '#FF9B44',
        width: '100%',
        height: '87.387px',
        flexShrink: 0,
        display: 'flex',
        justifyContent: 'center'
      }}
    >
      <Toolbar>
        <Container
          style={{
            display: 'flex',
            width: '100%',
            // padding: '0px 100px',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>
            {/* Replace with your custom icon */}
            <a style={{ display: 'flex', alignItems: 'center', gap: '10px' }} href='https://www.daftarpro.com/'>
            <img
              src={DaftarProLogo} // Relative path to the SVG file
              alt="Frame"
            //   width="44.166px"
            //   height="44.17px"
            />
            </a>
          </span>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '36px',marginLeft:"100px" }}>
          <Link 
                smooth spy to="home"
                duration={500} 
                className='nav-link-text topnav2'
                // onClick={()=>{setActive('home')}} 
                // onScroll={()=>{setNav('home')}}
                // activeClass={(active === "home") ? 'nav-link-text-active' : ''}
                color="inherit"
                style={{fontFamily: 'Montserrat', fontSize: '16px', height: 'auto' ,fontWeight: '400'}}
            >
                Home
            </Link>
            <Link 
                smooth spy to="features"
                duration={500} 
                className='nav-link-text topnav2'
                // onClick={()=>{setActive('home')}} 
                // onScroll={()=>{setNav('home')}}
                // activeClass={(active === "home") ? 'nav-link-text-active' : ''}
                color="inherit"
                style={{fontFamily: 'Montserrat', fontSize: '16px', height: 'auto' ,fontWeight: '400'}}
            >
                Features
            </Link>
            <Link 
                smooth spy to="testimonials"
                duration={500} 
                className='nav-link-text topnav2'
                // onClick={()=>{setActive('home')}} 
                // onScroll={()=>{setNav('home')}}
                // activeClass={(active === "home") ? 'nav-link-text-active' : ''}
                color="inherit"
                style={{fontFamily: 'Montserrat', fontSize: '16px', height: 'auto' ,fontWeight: '400'}}
            >
                Testimonials
            </Link>
            <Link 
                smooth spy to="pricing"
                duration={500} 
                className='nav-link-text topnav2'
                // onClick={()=>{setActive('home')}} 
                // onScroll={()=>{setNav('home')}}
                // activeClass={(active === "home") ? 'nav-link-text-active' : ''}
                color="inherit"
                style={{fontFamily: 'Montserrat', fontSize: '16px', height: 'auto' ,fontWeight: '400'}}
            >
                Pricing
            </Link>
            <Link 
                smooth spy to="faq"
                duration={500} 
                className='nav-link-text topnav2'
                // onClick={()=>{setActive('home')}} 
                // onScroll={()=>{setNav('home')}}
                // activeClass={(active === "home") ? 'nav-link-text-active' : ''}
                color="inherit"
                style={{fontFamily: 'Montserrat', fontSize: '16px', height: 'auto' ,fontWeight: '400'}}
            >
                FAQ
            </Link>
            {/* <Button component={Link} to="/features" color="inherit">
              Features
            </Button>
            <Button component={Link} to="/testimonials" color="inherit">
              Testimonials
            </Button>
            <Button component={Link} to="/pricing" color="inherit">
              Pricing
            </Button>
            <Button component={Link} to="/faq" color="inherit" >
              FAQ
            </Button> */}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '100px' }}>
            <button
            //   component={Link}
              to="/login"
              color="inherit"
              className='topnav2'
              style={{
                display: 'flex',
                padding: '6px 24px',
                alignItems: 'center',
                borderRadius: '31px',
                border: '2px solid white',
                color: 'white',
                background: 'transparent'
              }}
              onClick={() => nav('/login')}
            >
              Login
            </button>
            <button
            //   component={Link}
            //   to="/register"
              className='topnav2'
              variant="contained"
              color="primary"
              style={{
                display: 'flex',
                padding: '6px 24px',
                alignItems: 'center',
                borderRadius: '31px',
                border: '2px solid #F7F7F7',
                background: 'white',
                color: '#FF9B44',
                boxShadow: 'none'
              }}
              onClick={() => nav('/register')}
            >
              Register
            </button>
          </div>
        </Container>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;