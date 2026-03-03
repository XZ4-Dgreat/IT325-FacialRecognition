<?php
// models/User.php
class User {
    private $conn;
    private $table_name = "users";

    public $id;
    public $fullname;
    public $username;
    public $password;
    public $face_descriptor;
    public $face_image_path;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Create new user
    public function create() {
        $query = "INSERT INTO " . $this->table_name . "
                  SET fullname=:fullname, username=:username, 
                      password=:password, face_descriptor=:face_descriptor,
                      face_image_path=:face_image_path";

        $stmt = $this->conn->prepare($query);

        // Sanitize
        $this->fullname = htmlspecialchars(strip_tags($this->fullname));
        $this->username = htmlspecialchars(strip_tags($this->username));
        
        // HASH THE PASSWORD
        $hashed_password = password_hash($this->password, PASSWORD_BCRYPT);
        
        $this->face_descriptor = json_encode($this->face_descriptor);

        // Bind data
        $stmt->bindParam(":fullname", $this->fullname);
        $stmt->bindParam(":username", $this->username);
        $stmt->bindParam(":password", $hashed_password);
        $stmt->bindParam(":face_descriptor", $this->face_descriptor);
        $stmt->bindParam(":face_image_path", $this->face_image_path);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Check if username exists
    public function usernameExists() {
        $query = "SELECT id, fullname, password, face_descriptor, face_image_path 
                  FROM " . $this->table_name . " 
                  WHERE username = :username LIMIT 0,1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":username", $this->username);
        $stmt->execute();

        if($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $this->id = $row['id'];
            $this->fullname = $row['fullname'];
            $this->password = $row['password'];
            $this->face_descriptor = json_decode($row['face_descriptor']);
            $this->face_image_path = $row['face_image_path'];
            return true;
        }
        return false;
    }

    // Verify password
    public function verifyPassword($password) {
        return password_verify($password, $this->password);
    }
}
?>