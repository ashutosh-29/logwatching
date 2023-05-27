const express=require('express');
const fs=require('fs');
const socket=require('socket.io');

const app=express();
const port=4000;
const FileName="LogFiles.txt";
const maxLogSize=10;

let FileSize=0;
let recentLogs=[];

let newLogs;

app.get('/',(req,res)=>{
    res.send("Server is working fine");
});

const initialiseRecentLogs=()=>{
    fs.readFile(FileName,'utf8',(err,data)=>{
        if(err){
            console.log("Error File reading the File");
        }
        else{
            const allLogs=data.split('\n');
            var i=0;
            if(allLogs.length>maxLogSize)i=allLogs.length-maxLogSize
            for(;i<allLogs.length;i++){
                recentLogs.push(allLogs[i]);
            }
            console.log(recentLogs);
        }
    });
    fs.stat(FileName,(err,stats)=>{
        if(err){
            console.log("Error in checking size of log files");
        }
        else{
            const curFileSize=stats.size;
            FileSize=curFileSize;
        }
        
    });
}

const updateRecentLogs=()=>{
    fs.readFile(FileName,'utf8',(err,data)=>{
        if(err){
            console.log("Error File reading the File");
        }
        else{
            const allLogs=data.split('\n');
            recentLogs.push(allLogs[allLogs.length-1]);
            newLogs=allLogs[allLogs.length-1];
            console.log(newLogs);
        }
    });
}

const detectChanges= ()=>{
    fs.stat(FileName,(err,stats)=>{
        if(err){
            console.log("Error in detecting changes in log files");
        }
        else{
            const curFileSize=stats.size;
            if(curFileSize!=FileSize){
                console.log("File Updated");
                FileSize=curFileSize;
                updateRecentLogs();
            }
        }
        
    });
}

const server=app.listen(port,()=>{
    initialiseRecentLogs();
    
    console.log("listening port 4000");
});

const io=socket(server);

io.on('connection',(socket)=>{

    setInterval(detectChanges,1000);
    socket.emit("checkLogs", recentLogs);
});

