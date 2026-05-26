# 🌿 Green Bloom 

> A full-stack e-commerce platform designed to streamline the online browsing, purchasing, and delivery of indoor and outdoor plants.

## 📖 The Problem & Solution
While many e-commerce platforms exist, finding a dedicated, intuitive marketplace specifically for purchasing plants can be fragmented. Green Bloom provides a centralized, user-friendly storefront where users can browse plant inventories, manage their shopping carts, and process delivery orders. The backend is designed to efficiently handle inventory state and user transactions.

## 🛠 Tech Stack & Architecture
* **Backend:** Python, Flask
* **Database:** MySQL
* **Local Server Environment:** XAMPP (Apache/MySQL)
* **Frontend:** HTML, CSS, JavaScript (Jinja2 Templates)

## 🚀 Local Setup & Installation

Follow these steps to get a local copy up and running.

### Prerequisites
* Python 3.8+ installed
* XAMPP installed and configured

### 1. Database Configuration (XAMPP)
1. Open the XAMPP Control Panel and start the **Apache** and **MySQL** modules.
2. Open your browser and navigate to `http://localhost/phpmyadmin/`.
3. Create a new database named `green_bloom_db`.
4. Import the database schema and sample data:
   * Click on the `green_bloom_db` database.
   * Go to the **Import** tab.
   * Choose the `database_dump.sql` file located in the `/db` folder of this repository.
   * Click **Go** to execute the import.

### 2. Application Setup
Open your terminal and run the following commands:

```bash
# Clone the repository
git clone [https://github.com/RameshwarKatoch/green-bloom.git](https://github.com/RameshwarKatoch/green-bloom.git)

# Navigate into the project directory
cd green-bloom

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install the required dependencies
pip install -r requirements.txt
