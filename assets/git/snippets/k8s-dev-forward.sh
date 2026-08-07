# Kubernetes Dev Environment Port Forwarding Helper Function
f-all() {
    echo "🚀 Bắt đầu forward các dịch vụ môi trường DEV..."
    echo "💡 Nhấn Ctrl + C để TẮT HOÀN TOÀN tất cả các kết nối."
    echo "--------------------------------------------------"

    # Bẫy tín hiệu Ctrl+C (SIGINT) để tự động kill sạch các vòng lặp chạy ngầm bên dưới
    trap 'echo "\n🛑 Đang ngắt kết nối tất cả các port..."; kill $(jobs -p) 2>/dev/null; return' SIGINT

    # 1. Forward Postgres (Port máy local: 12345)
    while true; do 
        kubectl port-forward pod/postgres-postgresql-0 12345:5432 -n dev
        sleep 1
    done &

    # 2. Forward Redis Master (Port máy local: 63791)
    while true; do 
        kubectl port-forward pod/redis-master-0 63791:6379 -n dev
        sleep 1
    done &

    # 3. Forward EMQX (Port máy local: 9999)
    while true; do 
        kubectl port-forward pod/emqx-0 9999:18083 -n dev
        sleep 1
    done &

    # Giữ cho Terminal luôn mở và chờ lệnh Ctrl+C từ bạn
    wait
}
