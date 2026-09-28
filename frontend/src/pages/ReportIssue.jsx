import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

import {
    MapContainer,
    TileLayer,
    Marker,
    useMapEvents
} from "react-leaflet";

import "leaflet/dist/leaflet.css";


// --------------------------------
// MAP LOCATION MARKER
// --------------------------------

function LocationMarker({
    setLatitude,
    setLongitude,
    latitude,
    longitude,
    getAddress
}) {

    const map = useMapEvents({

        click(e) {

            const lat = e.latlng.lat;
            const lon = e.latlng.lng;

            setLatitude(lat);
            setLongitude(lon);

            getAddress(lat, lon);
        }

    });


    if (latitude && longitude) {

        map.setView(
            [Number(latitude), Number(longitude)],
            16
        );

    }


    return null;
}


// --------------------------------
// REPORT ISSUE COMPONENT
// --------------------------------

function ReportIssue() {

    const navigate = useNavigate();


    // FORM STATES

    const [description, setDescription] = useState("");
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");
    const [address, setAddress] = useState("");


    // MESSAGE / LOADING

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);


    // AI RESULT

    const [aiResult, setAiResult] = useState(null);


    // --------------------------------
    // GET CURRENT GPS LOCATION
    // --------------------------------

    const getLocation = () => {

        if (!navigator.geolocation) {

            setMessage(
                "Geolocation is not supported by your browser."
            );

            return;
        }


        setMessage("Getting your location...");


        navigator.geolocation.getCurrentPosition(

            async (position) => {

                const lat =
                    position.coords.latitude;

                const lon =
                    position.coords.longitude;


                setLatitude(lat);
                setLongitude(lon);


                await getAddress(lat, lon);


                setMessage(
                    "Location detected successfully."
                );

            },

            () => {

                setMessage(
                    "Unable to get your location. Please select a location on the map."
                );

            }

        );

    };


    // --------------------------------
    // REVERSE GEOCODING
    // --------------------------------

    const getAddress = async (lat, lon) => {

        try {

            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
            );


            const data =
                await response.json();


            if (data.display_name) {

                setAddress(
                    data.display_name
                );

            }

        } catch (error) {

            console.error(
                "Address lookup failed:",
                error
            );

        }

    };


    // --------------------------------
    // IMAGE SELECTION
    // --------------------------------

    const handleImageChange = (e) => {

        const file =
            e.target.files[0];


        if (!file) return;


        setImage(file);


        setImagePreview(
            URL.createObjectURL(file)
        );


        setAiResult(null);
        setMessage("");

    };


    // --------------------------------
    // SUBMIT REPORT
    // --------------------------------

    const handleSubmit = async (e) => {

        e.preventDefault();


        setMessage("");
        setAiResult(null);


        if (!description.trim()) {

            setMessage(
                "Please enter a description."
            );

            return;

        }


        if (!image) {

            setMessage(
                "Please upload an image."
            );

            return;

        }


        const token =
            localStorage.getItem("token");


        if (!token) {

            setMessage(
                "Please login before submitting a report."
            );

            navigate("/login");

            return;

        }


        try {

            setLoading(true);


            const formData =
                new FormData();


            formData.append(
                "description",
                description
            );


            if (latitude) {

                formData.append(
                    "latitude",
                    latitude
                );

            }


            if (longitude) {

                formData.append(
                    "longitude",
                    longitude
                );

            }


            if (address) {

                formData.append(
                    "address",
                    address
                );

            }


            formData.append(
                "image",
                image
            );


            const response =
                await api.post(
                    "/reports",
                    formData,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            setAiResult({

                reportCode:
                    response.data.report_code,

                issue:
                    response.data.ai_detected_issue,

                confidence:
                    response.data.ai_confidence,

                departmentId:
                    response.data.department_id,

                departmentName:
                    response.data.department_name,

                imageUrl:
                    response.data.image_url

            });


            setMessage(
                "Report submitted successfully!"
            );


            setDescription("");
            setImage(null);
            setImagePreview("");
            setLatitude("");
            setLongitude("");
            setAddress("");


        } catch (error) {

            console.error(error);


            setMessage(
                error.response?.data?.message ||
                "Failed to submit report."
            );


        } finally {

            setLoading(false);

        }

    };


    return (

        <div className="report-page">

            {/* PAGE HEADER */}

            <div className="report-title">

                <div className="report-page-badge">
                    🏛️ Citizen Complaint Portal
                </div>

                <h1>
                    Report a Civic Issue
                </h1>

                <p>
                    Help improve your community by reporting
                    a civic problem.
                </p>

            </div>


            {/* PROGRESS */}

            <div className="report-progress">

                <div className="progress-item active">
                    <span>1</span>
                    <p>Describe</p>
                </div>

                <div className="progress-line"></div>

                <div className="progress-item">
                    <span>2</span>
                    <p>Photo</p>
                </div>

                <div className="progress-line"></div>

                <div className="progress-item">
                    <span>3</span>
                    <p>Location</p>
                </div>

                <div className="progress-line"></div>

                <div className="progress-item">
                    <span>✓</span>
                    <p>Submit</p>
                </div>

            </div>


            {/* FORM */}

            <form
                onSubmit={handleSubmit}
                className="report-form"
            >

                {/* STEP 1 */}

                <div className="report-section">

                    <div className="section-heading">

                        <span className="section-number">
                            1
                        </span>

                        <div>
                            <h2>Issue Details</h2>

                            <p>
                                Tell us about the problem.
                            </p>
                        </div>

                    </div>


                    <div className="ai-info-box">

                        <div className="ai-info-title">
                            <span>🤖</span>
                            <strong>
                                AI-Powered Detection
                            </strong>
                        </div>

                        <p>
                            You don't need to select an issue
                            category. Upload a clear photo and
                            JanaSeva AI will automatically identify
                            the civic problem and assign it to the
                            appropriate department.
                        </p>

                    </div>


                    <label>
                        Description
                    </label>

                    <textarea
                        value={description}
                        onChange={(e) =>
                            setDescription(e.target.value)
                        }
                        placeholder="Describe the civic problem in detail..."
                    />

                    <div className="input-hint">
                        💡 Mention what happened and where the
                        problem is located.
                    </div>

                </div>


                {/* STEP 2 */}

                <div className="report-section">

                    <div className="section-heading">

                        <span className="section-number">
                            2
                        </span>

                        <div>
                            <h2>Add a Photo</h2>

                            <p>
                                A photo helps AI identify
                                the problem automatically.
                            </p>
                        </div>

                    </div>


                    <div className="upload-area">

                        <div className="upload-icon">
                            📷
                        </div>

                        <h3>
                            Upload a photo
                        </h3>

                        <p>
                            Choose a clear image of the civic problem.
                        </p>

                        <label
                            htmlFor="issue-image"
                            className="upload-button"
                        >
                            Choose Image
                        </label>

                        <input
                            id="issue-image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                        />

                    </div>


                    {imagePreview && (

                        <div className="image-preview">

                            <div className="preview-header">

                                <strong>
                                    Image Preview
                                </strong>

                                <span>
                                    ✓ Selected
                                </span>

                            </div>

                            <img
                                src={imagePreview}
                                alt="Selected civic issue"
                            />

                        </div>

                    )}

                </div>


                {/* STEP 3 */}

                <div className="report-section">

                    <div className="section-heading">

                        <span className="section-number">
                            3
                        </span>

                        <div>
                            <h2>Issue Location</h2>

                            <p>
                                Select the exact location
                                of the problem.
                            </p>
                        </div>

                    </div>


                    <button
                        type="button"
                        className="location-button"
                        onClick={getLocation}
                    >
                        📍 Use My Current Location
                    </button>


                    <div className="map-container">

                        <MapContainer
                            center={[
                                17.3850,
                                78.4867
                            ]}
                            zoom={13}
                            style={{
                                height: "400px",
                                width: "100%"
                            }}
                        >

                            <TileLayer
                                attribution="&copy; OpenStreetMap contributors"
                                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />


                            <LocationMarker
                                setLatitude={setLatitude}
                                setLongitude={setLongitude}
                                latitude={latitude}
                                longitude={longitude}
                                getAddress={getAddress}
                            />


                            {latitude &&
                                longitude && (

                                    <Marker
                                        position={[
                                            Number(latitude),
                                            Number(longitude)
                                        ]}
                                    />

                                )}

                        </MapContainer>

                    </div>


                    <div className="coordinates">

                        <div>

                            <label>
                                Latitude
                            </label>

                            <input
                                value={latitude}
                                readOnly
                                placeholder="Select location"
                            />

                        </div>


                        <div>

                            <label>
                                Longitude
                            </label>

                            <input
                                value={longitude}
                                readOnly
                                placeholder="Select location"
                            />

                        </div>

                    </div>


                    <label>
                        Address
                    </label>

                    <textarea
                        value={address}
                        onChange={(e) =>
                            setAddress(e.target.value)
                        }
                        placeholder="Address will appear automatically..."
                    />

                </div>


                {/* AI RESULT */}

                {aiResult && (

                    <div className="ai-result-box">

                        <div className="ai-result-header">
                            <div className="ai-result-icon">
                                🤖
                            </div>

                            <div>
                                <h2>
                                    AI Analysis Complete
                                </h2>

                                <p>
                                    Your complaint has been analyzed.
                                </p>
                            </div>
                        </div>


                        <div className="ai-result-grid">

                            <div className="ai-result-card">

                                <span>
                                    Detected Issue
                                </span>

                                <strong>
                                    {aiResult.issue}
                                </strong>

                            </div>


                            <div className="ai-result-card">

                                <span>
                                    Confidence
                                </span>

                                <strong>
                                    {aiResult.confidence}%
                                </strong>

                            </div>


                            <div className="ai-result-card">

                                <span>
                                    Department
                                </span>

                                <strong>
                                    {aiResult.departmentName}
                                </strong>

                            </div>


                            <div className="ai-result-card">

                                <span>
                                    Report Code
                                </span>

                                <strong>
                                    {aiResult.reportCode}
                                </strong>

                            </div>

                        </div>

                    </div>

                )}


                {/* MESSAGE */}

                {message && (

                    <div
                        className={
                            message.includes("successfully")
                                ? "form-message success"
                                : "form-message"
                        }
                    >
                        {message}
                    </div>

                )}


                {/* SUBMIT */}

                <div className="submit-section">

                    <button
                        type="submit"
                        disabled={loading}
                        className="submit-report-button"
                    >

                        {loading
                            ? "🤖 Analyzing Image..."
                            : "🚀 Submit Report"
                        }

                    </button>

                    <p className="submit-note">
                        Your photo will be analyzed by JanaSeva AI
                        before the report is routed.
                    </p>

                </div>

            </form>

        </div>

    );

}

export default ReportIssue;