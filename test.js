const express = require("express");
const app = express();
const mongoose = require('mongoose');
const mongojs = require('mongojs');
const mysql = require('mysql');
const { VARCHAR } = require("mysql/lib/protocol/constants/types");

//connection to MongoDb data base
const connectDB = async () => {
    try {
        await mongoose.connect('the local link to my mongodb data base', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("MongoDB Connected")
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
  };
  connectDB();


  //connectiong to Mysql data base
  var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "the name of mysql data base that i used"
  });

  con.connect((err)=>{
      if(err){
          console.log(err);
      }
      else{
          console.log('Mysql connected!');
          const db = mongojs('test',[]);
db.listCollections((err, res)=>{
    //getting a list of all the collections present in the Mongo data base
    if(err){
        console.log(err);
    }
    else {
        let vals =[];
        for(let k=0;k<res.length;k++){
            
            //starting to write our queries
            let sql1 = `CREATE TABLE IF NOT EXISTS ${res[k].name.split(" ").join("_")} (`;
            //sql1 is query to create a table that has the same name of a giving collection
            let sql2 = `INSERT INTO ${res[k].name.split(" ").join("_")} (`
            //sql2 is a query to insert values from the collection into the newly created table
            db.collection(res[k].name).find({}, (err, doc)=>{
                //going through the collection one by one
                if(err){
                    console.log(err);
                }
                else {
                    //getting an array of all the propreties of the objects in the collection to complete our queries
                    let props = Object.keys(doc[0]);
                    for(let j=1;j<props.length;j++){
                        if(j==props.length-1){
                            sql1+=`${props[j]} VARCHAR(255))`;
                            sql2+=`${props[j]})`;
                        }
                        else {
                            sql1+=`${props[j]} VARCHAR(255), `;
                            sql2+=`${props[j]},`
                        }
                    }
                    
                    
                }
                sql2+=` VALUES `
                for(let a=0;a<doc.length;a++){
                    // getting an array of all the value of an object in a giving collection to insert its valus in the new table with sql2
                    vals = Object.values(doc[a]);
                    sql2+='(';
                     for(let i=1;i<vals.length;i++){
                         if((i===vals.length-1) && (a!=doc.length-1)){
                             sql2+=`'${vals[i]}'),`;
                    }
                    else if((i===vals.length-1) && (a===doc.length-1)){
                        sql2+=`'${vals[i]}')`;
                    }
                    else {
                            sql2+=`'${vals[i]}',`;
                    }
                }
                

                         
                }
                //elimenating the ',' in the end of query 2 to avoid execution problems
                sql2.slice(0, sql2.length-1);

                //executing sql1 in order to create a table for each collection in the mongo data base
                con.query(sql1, (err, result)=>{
                    if(err){
                        console.log(err);
                    }
                    else {
                        console.log('Table creation process is done!')
                    }
                })

                //executing sql2 to insert data to each table in the mysql data base
                con.query(sql2, (err, result)=>{
                    if(err){
                        console.log(err);
                    }
                    else {
                        console.log('insertion process is done!')
                    }
                })
                
                
            
            });
            
        }
    }
})
      }
  })



   
    


