import random
import string
from datetime import datetime, timedelta
from faker import Faker
import pymysql

# ==============================
# Configuration Area
# ==============================
DATABASE_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '123456',
    'database': 'lyf_gym_db',
    'port': 3306,
    'charset': 'utf8mb4'
}

NUM_MEMBERS = 50
NUM_COACHES = 5

# ==============================

fake = Faker("zh_CN")

def get_connection():
    return pymysql.connect(**DATABASE_CONFIG)

def random_date(start, end):
    return fake.date_time_between(start_date=start, end_date=end)

def generate_members(conn):
    print("Generating member data...")
    member_types = ["月卡", "季卡", "年卡"]
    statuses = ["有效", "过期"]
    
    inserted = 0
    for _ in range(NUM_MEMBERS):
        m_type = random.choice(member_types)
        join_date = random_date("-1y", "now")
        
        if m_type == "月卡":
            days_left = random.randint(1, 30)
        elif m_type == "季卡":
            days_left = random.randint(31, 90)
        else:
            days_left = random.randint(91, 365)
        
        status = "有效" if days_left > 0 else "过期"
        
        name = fake.name()
        phone = fake.phone_number()[:11]
        
        try:
            with conn.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO members (name, phone, type, days_left, status) VALUES (%s, %s, %s, %s, %s)",
                    (name, phone, m_type, days_left, status)
                )
            inserted += 1
        except pymysql.err.IntegrityError:
            continue
    
    conn.commit()
    print(f"[OK] Generated {inserted} member records")

def generate_coaches(conn):
    print("Generating coach data...")
    
    specialties = ["增肌", "减脂", "瑜伽", "普拉提", "拳击", "力量训练", "CrossFit"]
    tags_pool = ["金牌教练", "资深教练", "明星教练", "认证教练", "5年+经验"]
    
    inserted = 0
    for _ in range(NUM_COACHES):
        name = fake.name_male() if random.random() > 0.3 else fake.name()
        specialty = ", ".join(random.sample(specialties, random.randint(1, 3)))
        tags = ", ".join(random.sample(tags_pool, random.randint(1, 2)))
        experience = random.randint(1, 10)
        is_gold = random.random() > 0.6
        
        try:
            with conn.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO coaches (name, specialty, tags, experience, is_gold) VALUES (%s, %s, %s, %s, %s)",
                    (name, specialty, tags, experience, is_gold)
                )
            inserted += 1
        except Exception as e:
            continue
    
    conn.commit()
    print(f"[OK] Generated {inserted} coach records")

def main():
    print("=" * 40)
    print("=== Gym Data Seeding Script ===")
    print("=" * 40)
    
    try:
        conn = get_connection()
        print("[OK] Database connected")
    except Exception as e:
        print(f"[ERROR] Database connection failed: {e}")
        print("Make sure MySQL is running and database exists")
        return
    
    generate_members(conn)
    generate_coaches(conn)
    
    with conn.cursor() as cursor:
        cursor.execute("SELECT COUNT(*) FROM members")
        member_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM coaches")
        coach_count = cursor.fetchone()[0]
    
    print("=" * 40)
    print(f"[STATS] Current data:")
    print(f"   - Total members: {member_count}")
    print(f"   - Total coaches: {coach_count}")
    print("=" * 40)
    
    conn.close()
    print("[OK] Data seeding completed!")

if __name__ == "__main__":
    main()