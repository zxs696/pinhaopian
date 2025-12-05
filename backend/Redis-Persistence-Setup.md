# Redis持久化配置指南

## 概述

为了确保重启Spring Boot后端后token不失效，需要配置Redis服务器启用持久化功能。本指南将说明如何配置Redis服务器以确保持久化。

## 配置步骤

### 1. 使用提供的Redis配置文件

项目根目录下提供了`redis.conf`配置文件，该文件已配置了以下持久化设置：

- **RDB持久化**：定期将数据集快照写入磁盘
  - 900秒内至少有1个key变化时保存
  - 300秒内至少有10个key变化时保存
  - 60秒内至少有10000个key变化时保存

- **AOF持久化**：记录每个写操作命令
  - 启用AOF持久化 (`appendonly yes`)
  - 每秒同步一次 (`appendfsync everysec`)

### 2. 启动Redis服务器

#### Windows系统

```bash
# 使用配置文件启动Redis服务器
redis-server.exe redis.conf
```

#### Linux/Mac系统

```bash
# 使用配置文件启动Redis服务器
redis-server redis.conf
```

### 3. 验证持久化配置

启动Redis服务器后，可以通过以下命令验证持久化配置：

```bash
# 连接到Redis服务器
redis-cli

# 验证AOF是否启用
CONFIG GET appendonly
# 应该返回
# 1) "appendonly"
# 2) "yes"

# 验证RDB保存规则
CONFIG GET save
# 应该返回
# 1) "save"
# 2) "900 1 300 10 60 10000"
```

### 4. 测试持久化功能

1. 在Redis中设置一些数据：
   ```bash
   SET test_key "test_value"
   ```

2. 确认数据已保存：
   ```bash
   GET test_key
   ```

3. 重启Redis服务器：
   ```bash
   # 停止Redis服务器
   redis-cli shutdown
   
   # 重新启动Redis服务器
   redis-server redis.conf
   ```

4. 验证数据是否仍然存在：
   ```bash
   GET test_key
   # 应该返回 "test_value"
   ```

## 注意事项

1. **安全性**：配置文件中设置了密码`000000`，生产环境中应使用更安全的密码。

2. **内存限制**：配置文件中设置了最大内存为256MB，根据实际需求可以调整。

3. **备份策略**：建议定期备份Redis数据文件（`dump.rdb`和`appendonly.aof`）。

4. **监控**：在生产环境中，建议监控Redis服务器的内存使用情况和持久化操作的性能影响。

## 与JWT+Shiro集成

通过上述Redis持久化配置，结合JWT+Shiro实现中的以下机制，可以确保重启后端后token不失效：

1. **固定JWT密钥**：`JwtUtils`类中使用固定密钥，确保重启后仍能验证旧token
2. **Redis存储token状态**：用户token与用户的映射关系存储在Redis中，重启后仍然有效
3. **持久化配置**：Redis的RDB和AOF持久化确保数据在服务器重启后不丢失

## 故障排除

如果重启后token仍然失效，请检查：

1. Redis服务器是否使用了正确的配置文件启动
2. Redis数据文件（`dump.rdb`和`appendonly.aof`）是否存在且可读
3. JWT密钥配置是否正确且固定
4. Redis连接配置是否正确