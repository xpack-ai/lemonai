

const imgType = ['png','jpg','svg','jpeg','gif','webp','bmp']
const blobTypeDict = ['png','jpg','svg','jpeg','gif','webp','bmp','pdf']

// 
function getFileReponseTypeByName(filename){
    const fileExtendName = filename.split('.').pop();
    if(blobTypeDict.includes(fileExtendName)){
        return 'blob';
    }else{
        return 'json';
    }
};




export default {
    getFileReponseTypeByName,
    imgType
};