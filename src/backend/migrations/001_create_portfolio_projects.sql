-- Additive migration for the Projects gallery. Existing portfolio tables are untouched.
-- Run this once against the configured MySQL/MariaDB database before deploying the API.
CREATE TABLE IF NOT EXISTS portfolio_projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    technologies TEXT NOT NULL,
    project_url VARCHAR(2048) NOT NULL,
    github_url VARCHAR(2048) NULL,
    image_url VARCHAR(2048) NULL,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_portfolio_projects_featured_id (is_featured, id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
