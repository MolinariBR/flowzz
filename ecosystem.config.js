module.exports = {
  apps: [
    {
      name: "flowzz-api",
      script: "dist/server.js",
      cwd: "/home/flowzz/backend",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3001
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3001
      },
      error_file: "/home/flowzz/logs/api-error.log",
      out_file: "/home/flowzz/logs/api-out.log",
      log_file: "/home/flowzz/logs/api.log",
      merge_logs: true,
      time: true,
      autorestart: true,
      max_memory_restart: "1G",
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: "10s"
    },
    {
      name: "flow-frontend",
      script: "npm",
      args: "start",
      cwd: "/home/flowzz/flow",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3000
      },
      error_file: "/home/flowzz/logs/flow-error.log",
      out_file: "/home/flowzz/logs/flow-out.log",
      log_file: "/home/flowzz/logs/flow.log",
      merge_logs: true,
      time: true,
      autorestart: true,
      max_memory_restart: "1G",
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: "10s"
    },
    {
      name: "flowzz-landing",
      script: "serve",
      args: "dist -s -l 3003",
      cwd: "/home/flowzz/landing",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3003
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3003
      },
      error_file: "/home/flowzz/logs/landing-error.log",
      out_file: "/home/flowzz/logs/landing-out.log",
      log_file: "/home/flowzz/logs/landing.log",
      merge_logs: true,
      time: true,
      autorestart: true,
      max_memory_restart: "500M",
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: "10s"
    }
  ]
};