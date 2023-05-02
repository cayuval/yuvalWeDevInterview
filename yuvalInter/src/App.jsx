import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import AWS from 'aws-sdk';


function App() {
  const [imageUrls, setImageUrls] = useState([]);
  AWS.config.update({
    accessKeyId: 'AKIAVFYA5WWID6TZJWVH',
    secretAccessKey: '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',
    region: 'us-east-2'
  });
  const s3 = new AWS.S3();
  useEffect(() => {
    const params = {
      Bucket: 'yuvalsbucket09101999',
    };

    s3.listObjects(params, (err, data) => {
      if (err) {
        console.log('Error:', err);
      } else {
        const urls = data.Contents.map((obj) => {
          return s3.getSignedUrl('getObject', { Bucket: params.Bucket, Key: obj.Key });
        });
        setImageUrls(urls);
      }
    });
  }, []);

  const handleFileInput = (event) => {


    const file = event.target.files[0];

    const params = {
      Bucket: 'yuvalsbucket09101999',
      Key: file.name,
      Body: file,
      ContentType: file.type,
      ACL: 'public-read'
    };

    s3.upload(params, function (err, data) {
      if (err) {
        console.log(err);
      } else {
        console.log('Successfully uploaded image.');
      }
    });
  }



  return (
    <>
      <input type="file" onChange={handleFileInput} />
      <div>
        {imageUrls.map((url, index) => (
          <img key={index} src={url} alt={`Image ${index}`} height="100px" />
        ))}
      </div>

    </>
  )
}

export default App
