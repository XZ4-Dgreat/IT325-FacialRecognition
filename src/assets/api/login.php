<?php
// api/login.php
require_once 'cors.php';
header("Content-Type: application/json; charset=UTF-8");

include_once '../config/database.php';
include_once '../models/User.php';
include_once '../utils/SessionManager.php';

$database = new Database();
$db = $database->getConnection();
$user = new User($db);
$sessionManager = new SessionManager($db);

$data = json_decode(file_get_contents("php://input"));

if (empty($data->username) || empty($data->password)) {
    http_response_code(400);
    echo json_encode(array(
        "success" => false,
        "message" => "Username and password required."
    ));
    exit();
}

$user->username = $data->username;

if ($user->usernameExists() && $user->verifyPassword($data->password)) {
    
    // Create session
    $token = $sessionManager->createSession($user->id);
    
    if ($token) {
        http_response_code(200);
        echo json_encode(array(
            "success" => true,
            "message" => "Login successful.",
            "token" => $token,
            "user" => array(
                "id" => $user->id,
                "fullname" => $user->fullname,
                "username" => $user->username,
                "has_face_data" => !empty($user->face_descriptor)
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
    http_response_code(401);
    echo json_encode(array(
        "success" => false,
        "message" => "Invalid username or password."
    ));
}
?>