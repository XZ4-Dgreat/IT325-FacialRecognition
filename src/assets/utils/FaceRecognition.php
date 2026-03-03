<?php
// utils/FaceRecognition.php

class FaceRecognition {
    
    /**
     * Compare two face descriptors and return similarity score
     */
    public static function compareFaces($descriptor1, $descriptor2) {
        // Convert to arrays if they're objects
        $desc1 = (array) $descriptor1;
        $desc2 = (array) $descriptor2;
        
        // Use normalized features (MediaPipe already returns 0-1 values)
        $x1 = $desc1['normalizedX'] ?? $desc1['x'] ?? 0;
        $y1 = $desc1['normalizedY'] ?? $desc1['y'] ?? 0;
        $w1 = $desc1['normalizedWidth'] ?? $desc1['width'] ?? 0;
        $h1 = $desc1['normalizedHeight'] ?? $desc1['height'] ?? 0;
        
        $x2 = $desc2['normalizedX'] ?? $desc2['x'] ?? 0;
        $y2 = $desc2['normalizedY'] ?? $desc2['y'] ?? 0;
        $w2 = $desc2['normalizedWidth'] ?? $desc2['width'] ?? 0;
        $h2 = $desc2['normalizedHeight'] ?? $desc2['height'] ?? 0;
        
        // Calculate position difference
        $posDiff = sqrt(pow($x2 - $x1, 2) + pow($y2 - $y1, 2));
        
        // Calculate size difference
        $sizeDiff = abs(($w2 * $h2) - ($w1 * $h1));
        
        // Calculate aspect ratio difference
        $ar1 = $w1 / max($h1, 0.01);
        $ar2 = $w2 / max($h2, 0.01);
        $arDiff = abs($ar2 - $ar1);
        
        // Weighted score (lower diff = higher similarity)
        $posWeight = 0.4;
        $sizeWeight = 0.3;
        $arWeight = 0.3;
        
        $totalDiff = ($posDiff * $posWeight) + ($sizeDiff * $sizeWeight) + ($arDiff * $arWeight);
        
        // STRICTER CONVERSION - lower maxDiff means harder to get high scores
        $maxDiff = 0.3; // Reduced from 0.5 to 0.3 for stricter comparison
        $similarity = max(0, 100 - ($totalDiff / $maxDiff * 100));
        
        return min(100, $similarity);
    }
    
    /**
     * Save face image to server
     */
    public static function saveFaceImage($base64Image, $username) {
        // Remove data URL prefix
        $imageParts = explode(";base64,", $base64Image);
        if (count($imageParts) < 2) {
            return null;
        }
        
        $imageBase64 = $imageParts[1];
        $imageData = base64_decode($imageBase64);
        
        // Create directory if not exists
        $uploadDir = __DIR__ . '/../uploads/faces/';
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }
        
        // Generate filename
        $filename = $username . '_' . time() . '.jpg';
        $filepath = $uploadDir . $filename;
        
        // Save image
        if (file_put_contents($filepath, $imageData)) {
            return 'uploads/faces/' . $filename;
        }
        
        return null;
    }
}
?>