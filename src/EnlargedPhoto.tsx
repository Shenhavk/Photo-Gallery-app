import React from "react";

// EnlargedPhotoProps Interface
interface EnlargedPhotoProps {
    photoUrl: string;
    photoTitle: string;
    onClose: () => void;
}

// EnlargedPhoto Component
const EnlargedPhoto = ({ photoUrl, photoTitle, onClose }: EnlargedPhotoProps) => {
    return (
        <div className="col-12">
            <div className="modal show d-block" tabIndex={-1}>
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content bg-transparent border-0">
                        <div className="modal-header border-0">
                            <button
                                type="button"
                                className="close btn btn-dark"
                                onClick={() => onClose()}>
                                    <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <img src={photoUrl} alt={photoTitle} className="img-fluid"/>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal-backdrop show"></div>
        </div>
    );
};

export default EnlargedPhoto;