import express, { Application, Request, Response } from "express";
import app from "./app";


const port = 5000; 




const bootstrap=()=>{
    try {
        app.listen(port,()=>{
         console.log(`✅ Server is running on http://localhost:${port}`);
        })
    } catch (error) {
        
    }
}
bootstrap()