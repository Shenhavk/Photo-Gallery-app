import React from 'react';

// Photo Interface
interface Photo {
    title: string;
    user: number;
    id: number;
    description: string;
    url: string;
};

// PhotoItemProps Interface
interface PhotoItemProps {
    photo: Photo;
    onImageClick: () => void;
    isSelected: boolean;
    onSelectToggle: (photoId: number) => void;
};

// PhotoItem Component
const PhotoItem = ({ photo, onImageClick, isSelected, onSelectToggle }: PhotoItemProps) => {
    return (
        <div key={photo.id} className="col-lg-3 col-md-4 col-sm-6 p-2">
            <div className="card">
                <img src={photo.url} alt={photo.title} className="card-img-top custom-height" onClick={onImageClick} />
                <div className="form-check form-check-inline position-absolute top-0 end-0 p-2">
                    <input type="checkbox" checked={isSelected} onChange={() => onSelectToggle(photo.id)} />
                </div>
            </div>
        </div>
    )
};

export default PhotoItem;