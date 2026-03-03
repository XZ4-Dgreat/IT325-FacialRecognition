<?php
// api/face-login.php
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
include_once __DIR__ . '/../utils/SessionManager.php';
include_once __DIR__ . '/../utils/FaceRecognition.php';

$database = new Database();
$db = $database->getConnection();
$user = new User($db);
$sessionManager = new SessionManager($db);

$data = json_decode(file_get_contents("php://input"));

// Validate input
if (empty($data->username) || empty($data->face_descriptor)) {
    http_response_code(400);
    echo json_encode(array(
        "success" => false,
        "message" => "Username and face data required."
    ));
    exit();
}

$user->username = $data->username;

if ($user->usernameExists()) {
    
    // Check if user has face data registered
    if (empty($user->face_descriptor)) {
        http_response_code(401);
        echo json_encode(array(
            "success" => false,
            "message" => "No face data registered for this user. Please register with face first."
        ));
        exit();
    }
    
    // Compare the captured face with stored face
    $similarity = FaceRecognition::compareFaces(
        $data->face_descriptor,
        $user->face_descriptor
    );
    
    // Log the comparison for debugging
    error_log("Face comparison for user {$data->username}: Similarity = {$similarity}%");
    
    // INCREASED THRESHOLD - now requires 92% for acceptance
    $threshold = 92; // Increased from 50 to 92
    
    if ($similarity >= $threshold) {
        // Face matches - create session
        $token = $sessionManager->createSession($user->id);
        
        if ($token) {
            http_response_code(200);
            echo json_encode(array(
                "success" => true,
                "message" => "Face login successful.",
                "token" => $token,
                "similarity" => round($similarity, 2),
                "user" => array(
                    "id" => $user->id,
                    "fullname" => $user->fullname,
                    "username" => $user->username
                )
            ));
        } else {
            http_response_code(500);
            echo json_encode(array(
                "success" => false,
                "message" => "Unable to create session."
            ));
        }
    } else {
        // Face doesn't match
        http_response_code(401);
        echo json_encode(array(
            "success" => false,
            "message" => "Face does not match. Similarity: " . round($similarity, 2) . "% (required: {$threshold}%)"
        ));
    }
} else {
    http_response_code(401);
    echo json_encode(array(
        "success" => false,
        "message" => "User not found."
    ));
}
?>