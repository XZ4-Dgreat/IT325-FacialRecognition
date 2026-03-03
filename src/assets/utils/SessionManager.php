<?php
// utils/SessionManager.php
class SessionManager {
    private $conn;
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    // Create new session
    public function createSession($userId) {
        $token = bin2hex(random_bytes(32));
        $expires = date('Y-m-d H:i:s', strtotime('+7 days'));
        
        $query = "INSERT INTO user_sessions (user_id, session_token, expires_at)
                  VALUES (:user_id, :token, :expires)";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $userId);
        $stmt->bindParam(":token", $token);
        $stmt->bindParam(":expires", $expires);
        
        if ($stmt->execute()) {
            return $token;
        }
        return false;
    }
    
    // Verify session
    public function verifySession($token) {
        $query = "SELECT user_id FROM user_sessions 
                  WHERE session_token = :token AND expires_at > NOW()";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":token", $token);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            return $row['user_id'];
        }
        return false;
    }
    
    // Delete session (logout)
    public function deleteSession($token) {
        $query = "DELETE FROM user_sessions WHERE session_token = :token";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":token", $token);
        return $stmt->execute();
    }
}
?>