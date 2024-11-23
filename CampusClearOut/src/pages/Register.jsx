import React from "react";
import {useState} from 'react';
import {Form,Button} from "react-bootstrap";
const API = import.meta.env.VITE_BACKEND_URL;
import { useNavigate } from "react-router-dom";



export function Register(){
    const [username,setUsername]=useState("");
    const [emailAddress,setEmailAddress]=useState("");
    const [password,setPassword]=useState("");

    const navigate = useNavigate();


    const handleSubmit=async(e)=>{
        e.preventDefault();
        console.log("The username submitted is",username);
        const registrationData={username,emailAddress,password};
        console.log("Registration data being sent:", registrationData);
        //post the data to backend
        try {
            const response = await fetch(`/api/register`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(registrationData),
              credentials: "include"
            });
      
            if (response.ok) {
              console.log("Successfully registered");
              // reset form fields
              setUsername("");
              setEmailAddress("");
              setPassword("");

              //navigate back to login
              navigate("/login");
            } else {
              console.log("Failed to submit registration data");
            }
          } catch (error) {
            console.error("Error registering:", error);
          }
    }

    //create a form here in order to register
    return(
       <Form onSubmit={handleSubmit}>
            <Form.Group controlId="username">
                <Form.Label>Name:</Form.Label>
                <Form.Control
                    type="text"
                    value={username}
                    onChange={(e)=>setUsername(e.target.value)} required
                    placeholder="Enter your name"
                />
            </Form.Group>
            <Form.Group controlId="emailAddress">
                <Form.Label>Email Address:</Form.Label>
                <Form.Control
                    type="text"
                    value={emailAddress}
                    onChange={(e)=>setEmailAddress(e.target.value)} required
                    placeholder="Enter your email address"
                />
            </Form.Group>
            <Form.Group controlId="password">
                <Form.Label>Password:</Form.Label>
                <Form.Control
                    type="text"
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)} required
                    placeholder="Enter your password"
                />
            </Form.Group>
            <Button variant="primary" type="submit">
                Register
            </Button>
       </Form>
    );
}