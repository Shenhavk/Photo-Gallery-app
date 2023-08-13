import React, { useState, useEffect, useCallback } from 'react';
import PhotoItem from './PhotoItem';
import EnlargedPhoto from './EnlargedPhoto';

// Photo Interface
interface Photo {
    title: string;
    user: number;
    id: number;
    description: string;
    url: string;
}

// PhotoGallery Component
const PhotoGallery = () => {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [uploadedPhotos, setUploadedPhotos] = useState<Photo[]>([]);
    const [enlargedPhoto, setEnlargedPhoto] = useState<Photo | null>(null);
    const [deletedPhotos, setDeletedPhotos] = useState<number[]>([]);
    const [selectedPhotos, setSelectedPhotos] = useState<number[]>([]);
    const [amountOfPhotosPerPage, setAmountOfPhotosPerPage] = useState<number>(calcPhotosPerPage());
    const [currentPageNum, setCurrentPageNum] = useState<number>(1);
    const [uploadedPhotosId, setUploadedPhotosId] = useState<number>(0);

    // function is recreated if one of the dependencies changed
    const fetchPhotos = useCallback(async () => {
        const sourceUrl = `https://api.slingacademy.com/v1/sample-data/photos?offset=${(currentPageNum - 1) * amountOfPhotosPerPage}&limit=${amountOfPhotosPerPage}`;

        try {
            const response = await fetch(sourceUrl);
            const data = await response.json();
            // The response contains an array of photos
            let fetchedPhotosData: Photo[] = data.photos;
            // filter the deleted photos of the current page
            let updatedFetchedPhotos = fetchedPhotosData.filter(photo => !deletedPhotos.includes(photo.id));
            // continue fetching until got enough photos to fill my page
            while (amountOfPhotosPerPage !== updatedFetchedPhotos.length) {
                // calculate the missing images and fetch according to it
                const missingImages = fetchedPhotosData.length - updatedFetchedPhotos.length;
                const updatedSourceUrl = `https://api.slingacademy.com/v1/sample-data/photos?offset=${(currentPageNum - 1) * amountOfPhotosPerPage}&limit=${amountOfPhotosPerPage + missingImages}`;
                const response = await fetch(updatedSourceUrl);
                const data = await response.json();
                // The response contains an array of photos
                fetchedPhotosData = data.photos;
                updatedFetchedPhotos = fetchedPhotosData.filter(photo => !deletedPhotos.includes(photo.id));
                const isLastPhotoIncluded = fetchedPhotosData.some(photo => photo.id === 132);
                if (isLastPhotoIncluded) {
                    break;
                }
            }
            fetchedPhotosData = updatedFetchedPhotos;

            // show the uploaded by user photos if needed
            if (uploadedPhotos.length > ((currentPageNum - 1) * amountOfPhotosPerPage)) {
                if (uploadedPhotos.length >= (currentPageNum * amountOfPhotosPerPage)) {
                    const newPhotosArray = uploadedPhotos.slice(
                        (currentPageNum - 1) * amountOfPhotosPerPage,
                        currentPageNum * amountOfPhotosPerPage
                      );
                      setPhotos(newPhotosArray);
                } else {
                    const newPhotosArray = uploadedPhotos.slice(
                        (currentPageNum - 1) * amountOfPhotosPerPage,
                        uploadedPhotos.length
                      );
                      const length = newPhotosArray.length;
                      const remainingFetchedPhotos = fetchedPhotosData.slice(0, amountOfPhotosPerPage - length);
                      setPhotos(newPhotosArray.concat(remainingFetchedPhotos));
                }
            } else {
                setPhotos(fetchedPhotosData);
            }

        } catch(error) {
            console.error('Error fetching photos:', error);
        }
    }, [currentPageNum, amountOfPhotosPerPage, uploadedPhotos, deletedPhotos]);

    // This code will run anytime fetchPhotos function is recreated
    useEffect(() => {
        fetchPhotos();
    }, [fetchPhotos]);

    // Empty array of dependencies so this code, which responsible of adding event listener for window resize, will run only once
    useEffect(() => {
        const handleResize = () => {
            const newAmount = calcPhotosPerPage();
            setAmountOfPhotosPerPage(newAmount);
        };

        window.addEventListener('resize', handleResize);
    
        return () => {
          window.removeEventListener('resize', handleResize);
        };
    }, []);

    // calculate the number of photos per page by the screen width
    function calcPhotosPerPage() {
        const screenWidth = window.innerWidth;
        if (screenWidth >= 992) {
            return 12;
        } else if (screenWidth >= 768) {
            return 9;
        } else if (screenWidth >= 576) {
            return 6;
        } else {
            return 4;
        }
    };

    // close enlarged view of photo
    const toggleEnlargedImage = () => {
        setEnlargedPhoto(null);
    };

    // handle photo upload by user
    const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const photoUrl = URL.createObjectURL(file);
            const photo = {title: "Uploaded Photo", id: uploadedPhotosId, user: 0, description: "How fun is it to upload photos to my gallery", url: photoUrl};
            // Update the state to add the new photo URL
            setUploadedPhotos(prevPhotos => (prevPhotos ? [photo, ...prevPhotos] : [photo]));
            setUploadedPhotosId(uploadedPhotosId - 1);
            setCurrentPageNum(1);
        }
        // Reset the input element by setting its value to an empty string
        event.target.value = '';
    };

    // handle photo mark by user
    const handleSelectToogle = (photoId: number) => {
        if (selectedPhotos.includes(photoId)) {
            setSelectedPhotos(selectedPhotos.filter(item => item !== photoId));
        } else {
            setSelectedPhotos([...selectedPhotos, photoId]);
        }
    }

    // handle delete button press
    const handleDeleteSelected = () => {
        const updatedUploadedPhotos = uploadedPhotos.filter(photo => !selectedPhotos.includes(photo.id));
        setUploadedPhotos(updatedUploadedPhotos);
        setDeletedPhotos(prevDeletedPhotos => [...prevDeletedPhotos, ...selectedPhotos]);
        setSelectedPhotos([]);
    }

    return (
        <>
            <div className="container mt-4 background-image">
                <div className="header">
                    <h1 className="app-title">📸 Photo Paradise</h1>
                    <p className="tagline">Discover Beautiful Moments</p>
                </div>
                <div className="row">
                    {photos.map(photo => (
                        <PhotoItem key={photo.id} photo={photo} onImageClick={() => setEnlargedPhoto(photo)} isSelected={selectedPhotos.includes(photo.id)} onSelectToggle={handleSelectToogle} />
                    ))}
                </div>
                
                <div className="mt-3 d-flex justify-content-center align-items-center">
                    <button type="button" className="btn btn-light mx-2 shadow-sm" onClick={() => setCurrentPageNum(currentPageNum - 1)} disabled={currentPageNum === 1}>Previous</button>
                    <button type="button" className="btn btn-light mx-2 shadow-sm" onClick={() => setCurrentPageNum(currentPageNum + 1)} disabled={photos.length < amountOfPhotosPerPage}>Next</button>
                </div>

                {enlargedPhoto && (
                <EnlargedPhoto photoUrl={enlargedPhoto.url} photoTitle={enlargedPhoto.title} onClose={toggleEnlargedImage} />
                )}
            </div>

            <div className="position-fixed top-0 end-0 p-3">
                <label className="btn btn-light">
                    +Add
                    <input type="file" className="d-none" accept="image/*" onChange={handlePhotoUpload} />
                </label>
                <button type="button" className="btn btn-dark" onClick={handleDeleteSelected} disabled={selectedPhotos.length === 0}>🗑️</button>
            </div>
        </>
    );
};

export default PhotoGallery;