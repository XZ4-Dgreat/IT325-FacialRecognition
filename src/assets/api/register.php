<?php
// api/register.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once __DIR__ . '/../config/database.php';
include_once __DIR__ . '/../models/User.php';
include_once __DIR__ . '/../utils/FaceRecognition.php';

$database = new Database();
$db = $database->getConnection();
$user = new User($db);

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Validate required fields
if (empty($data->fullname) || empty($data->username) || empty($data->password)) {
    http_response_code(400);
    echo json_encode(array(
        "success" => false,
        "message" => "Unable to register. Fullname, username, and password required."
    ));
    exit();
}

// Validate password strength
$password = $data->password;
$uppercase = preg_match('@[A-Z]@', $password);
$lowercase = preg_match('@[a-z]@', $password);
$number = preg_match('@[0-9]@', $password);
$specialChars = preg_match('/[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?]/', $password);

if (!$uppercase || !$lowercase || !$number || !$specialChars || strlen($password) < 8) {
    http_response_code(400);
    echo json_encode(array(
        "success" => false,
        "message" => "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character."
    ));
    exit();
}

// Validate face data if provided (for face registration)
if (!empty($data->face_descriptor)) {
    // Check if face descriptor has required fields
    if (!isset($data->face_descriptor->normalizedX) || 
        !isset($data->face_descriptor->normalizedY) ||
        !isset($data->face_descriptor->normalizedWidth) ||
        !isset($data->face_descriptor->normalizedHeight)) {
        
        http_response_code(400);
        echo json_encode(array(
            "success" => false,
            "message" => "Invalid face descriptor format."
        ));
        exit();
    }
}

// Check if username already exists
$user->username = $data->username;
if ($user->usernameExists()) {
    http_response_code(400);
    echo json_encode(array(
        "success" => false,
        "message" => "Username already exists."
    ));
    exit();
}

// Set user properties
$user->fullname = $data->fullname;
$user->password = $data->password;

// Handle face data if provided
if (!empty($data->face_descriptor)) {
    $user->face_descriptor = $data->face_descriptor;
    
    // Save face image if provided
    if (!empty($data->face_image)) {
        $imagePath = FaceRecognition::saveFaceImage($data->face_image, $data->username);
        if ($imagePath) {
            $user->face_image_path = $imagePath;
        }
    }
}

// Create the user
if ($user->create()) {
    http_response_code(201);
    echo json_encode(array(
        "success" => true,
        "message" => "User registered successfully.",
        "user" => array(
            "username" => $user->username,
            "fullname" => $user->fullname,
            "has_face" => !empty($user->face_descriptor)
        )
    ));
} else {
    http_response_code(503);
    echo json_encode(array(
        "success" => false,
        "message" => "Unable to register user."
    ));
}
?>