//Evalua los archivos que se suben en el endpoint de filesUpload
export const fileFilter = (req:Express.Request,file:Express.Multer.File, callback:Function) => {
 
    //console.log(file)
    if(!file) return callback(new Error('File is empty'), false );
    
    //divide el archivo para evaluar la extension
    const fileExtension = file.mimetype.split('/')[1];
    const validExtensions = ['jpg','jpeg','png','gif','pdf'];

    if( validExtensions.includes(fileExtension)){
        return callback(null,true);
    }
    callback(null,false);
}