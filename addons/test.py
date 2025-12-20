import requests

BASE_URL = "http://127.0.0.1:9999"

def run_tests():
    print("--- 🧪 Starting ApparelDesk API Test ---")

    # 1. Test Status
    print("\n[1/3] Testing Status...")
    r1 = requests.get(f"{BASE_URL}/status")
    print("Response:", r1.json())

    # 2. Test Email Notification
    print("\n[2/3] Testing Email Notification...")
    r2 = requests.get(f"{BASE_URL}/notify-low-stock")
    print("Response:", r2.json())

    # 3. Test Visual Search
    print("\n[3/3] Testing Visual Search...")
    # Make sure user_query2.jpg exists!
    try:
        with open("user_query2.jpg", "rb") as img:
            files = {"image": img}
            r3 = requests.post(f"{BASE_URL}/visual-search", files=files)
            print("Response:", r3.json())
    except FileNotFoundError:
        print("Error: user_query2.jpg not found. Skip visual search test.")

if __name__ == "__main__":
    run_tests()