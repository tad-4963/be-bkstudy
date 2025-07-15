import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: 'dhnrbasoa',
    api_key: '292718816345247',
    api_secret: '9JF0AqnRd0z0tH37VAGIv-yjnIk'
});

export const uploadFile = (req, res) => {
    const file = req.file;

    if (!file) {
        return res.status(400).json({ error: 'There is no file to upload' });
    }
    const dataUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    const fileName = file.originalname.substring(0, file.originalname.lastIndexOf('.'));

    cloudinary.uploader.upload(dataUrl, {
        public_id: fileName,
        resource_type: 'auto',
        folder: 'Edupress'
    }, (err, result) => {
        if (result) {
            return res.status(201).json({
                fileUrl: result.secure_url
            });
        }
        else {
            return res.status(400).json({ errorMessage: err.message });
        }
    });
}

export const uploadFiles = (req, res) => {
    const listFile = req.files;
    
    const listResult = [];
    const errorList = [];
    if (!listFile || listFile.length === 0) {
        return res.status(400).json({ error: 'There is no file to upload' });
    }
    for (file in listFile){
        const dataUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        const fileName = file.originalname.substring(0, file.originalname.lastIndexOf('.'));

        cloudinary.uploader.upload(dataUrl, {
            public_id: fileName,
            resource_type: 'auto',
            folder: 'Edupress'
        }, (err, result) => {
            if (result) {
               listResult.push(result);
            }
            else{
                errorList.push(err.message);
            }
        });
    }
    if(errorList.length === 0){
        res.status(201).json({ message: 'Tệp được tải lên thành công.', listFile});
    }
    else{
        res.status(400).json({
            errorList: errorList
        })
    }
}
