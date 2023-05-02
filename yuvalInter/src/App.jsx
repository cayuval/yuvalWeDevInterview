import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import AWS from 'aws-sdk';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Audio } from 'react-loader-spinner'


function App() {
  const [imageUrls, setImageUrls] = useState([]);
  const [hoveredI, setHoveredI] = useState(-1);
  const [loading, setloading] = useState(false)

  AWS.config.update({
    accessKeyId: 'AKIAVFYA5WWID6TZJWVH',
    secretAccessKey: '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',
    region: 'us-east-2'
  });

  const s3 = new AWS.S3();

  useEffect(() => {
    setloading(true)
    const params = {
      Bucket: 'yuvalsbucket09101999',
    };

    s3.listObjects(params, (err, data) => {
      if (err) {
        console.log('Error:', err);
        notify("OOPS, Try again", false)
        setloading(false)
      } else {
        const urls = data.Contents.map((obj) => {
          return s3.getSignedUrl('getObject', { Bucket: params.Bucket, Key: obj.Key });
        });
        setImageUrls(urls);
        setloading(false)
      }
    });
  }, []);


  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setloading(true)

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
        setloading(false)
        notify("OOPS, Try again", false)
      } else {
        setloading(false)
        notify("Successfully uploaded image.", true)
      }
    });
  }

  const notify = (message, success) => {
    if (success) {
      toast.success(message, {
        position: toast.POSITION.BOTTOM_RIGHT
      });
    } else {
      toast.error(message, {
        position: toast.POSITION.BOTTOM_RIGHT
      })
    }
  }

  const handleDelete = (i) => {
    setloading(true)
    const params = {
      Bucket: 'yuvalsbucket09101999',
      Key: `images/image_${i}.jpg`
    };

    s3.deleteObject(params, (err, data) => {
      if (err) {
        notify("OOPS, Try again", false)
        console.log('Error:', err);
        setloading(false)
      } else {
        notify("Successfully deleted image.", true)
        // Update the list of image URLs to remove the deleted image
        setImageUrls((prevUrls) => prevUrls.filter((url, i) => i !== index));
        setloading(false)
      }
    });
  }



  return (
    <div className='App'>

      <div className="input">
        <input type="file" onChange={(e) => { handleFileChange(e) }} />
      </div>
      <div className="images">

        {imageUrls.map((url, index) => (
          <div
            key={index}
            className='image-container'
            onMouseEnter={() => setHoveredI(index)}
            onMouseLeave={() => { setHoveredI(-1) }}
          >

            <img src={url} alt={`Image ${index}`} height="100px" />

            {hoveredI === index && (
              <div className='overlay'>
                <FontAwesomeIcon
                  icon={faTrashAlt}
                  color='white'
                  onClick={() => handleDelete(index)}
                />
              </div>

            )}

          </div>
        ))}
      </div>
      {loading && <div className="loader">
        <Audio
          height="80"
          width="80"
          radius="9"
          color="blue"
          ariaLabel="loading"
          wrapperStyle
          wrapperClass />
      </div>
      }
      <ToastContainer />

    </div>
  )
}

export default App
