import { Button, CircularProgress, Stack, TextField } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useState } from "react";
import { useHistory, Link } from "react-router-dom";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Login.css";



const Login = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [username,updateUsername]=useState("");
  const [password,udpatePassword]=useState("");
  const history=useHistory();

 
  const login = async (formData) => {

  //  console.log(formData)
    let url=config.endpoint;
    try{

      let res= await axios.post(`${url}/auth/login`,formData);
      if(res.data.success){
        enqueueSnackbar("Logged in successfully",{ variant: 'success' });
        let {token,username,balance}=res.data;
        persistLogin(token,username,balance-0)
      
      }
    }catch(e){
      axios.post(`${url}/auth/login`,formData).catch((e)=>{
        if(e.response){
          console.log(e.response)
          enqueueSnackbar(e.response.data.message,{ variant: 'error' })
        }
        else {
          // Something happened in setting up the request that triggered an Error
          enqueueSnackbar("Something went wrong. Check that the backend is running, reachable and returns valid JSON.",{ variant: 'error' })
        }
      })
    }


  };

  let datas={
    "username":username,"password":password
  }
   const  evenHandler=()=>{
    validateInput(datas) && login(datas)
  }

  const validateInput = ({username,password}) => {
        if(username===""){
          enqueueSnackbar("Username is a required field",{ variant: 'warning' });
          return false;
        }
        if(password==="" || password.length<6){
          enqueueSnackbar("Password is a required field",{ variant: 'warning' });
          return false;
        }
        return true;
  };


  const persistLogin = (token, username, balance) => {

    localStorage.setItem("token",token);
    localStorage.setItem('username',username);
    localStorage.setItem('balance',balance);
    history.push("/")

  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      minHeight="100vh"
    >
      <Header hasHiddenAuthButtons={true} />
      <Box className="content">
        <Stack spacing={2} className="form">
          <h2 className={"title"}>Login</h2>
          <TextField 
          id="username"
           label="username" 
           name="username"
           value={username}
           onChange={(e)=>updateUsername(e.target.value)}
           type="text"
           variant="outlined" 
           fullWidth
           />
           <TextField 
          id="password"
           label="password" 
           type="password"
           name="password"
           value={password}
           onChange={(e)=>udpatePassword(e.target.value)}
           variant="outlined"
           fullWidth
           />
           <Button  
           className="button" 
           variant="contained"
           onClick={evenHandler}
           >LOGIN TO QKART</Button>
           <p className="secondary-action">
           Don’t have an account?{" "}
            <Link to="/register" className={"link"}>Register now</Link>
          </p>
           
        </Stack>
      </Box>
      <Footer />
    </Box>
  );
};

export default Login;
