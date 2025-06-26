import { defineStore } from 'pinia';
import { message } from "ant-design-vue";
import http from '@/utils/http';

export const useServerStore = defineStore('server', {
  state: () => ({
    servers: [],
  }),
  actions: {
    async fetchServers() {
      try {
        const list = await http.get('/api/mcp_server');
        console.log('response', list);
        this.servers = list;
        console.log('servers', this.servers);
      } catch (error) {
        message.error('Failed to fetch servers');
        console.error('Fetch servers error:', error);
      }
    },
    async addServer(server) {
      try {
        const mcp_server = await http.post('/api/mcp_server', server);
        console.log('add.server.response', mcp_server);
        this.servers.push(mcp_server);
        message.success("Server added successfully");
      } catch (error) {
        message.error('Failed to add server');
        console.error('Add server error:', error);
      }
    },
    async updateServer(server) {
      try {
        await http.put(`/api/mcp_server/${server.id}`, server);
        const index = this.servers.findIndex((s) => s.id === server.id);
        if (index !== -1) {
          this.servers[index] = server;
        }
        message.success("Server updated successfully");
      } catch (error) {
        message.error('Failed to update server');
        console.error('Update server error:', error);
      }
    },
    async deleteServer(serverId) {
      try {
        await http.del(`/api/mcp_server/${serverId}`);
        const index = this.servers.findIndex((s) => s.id === serverId);
        if (index !== -1) {
          this.servers.splice(index, 1);
        }
        message.success("Server deleted successfully");
      } catch (error) {
        message.error('Failed to delete server');
        console.error('Delete server error:', error);
      }
    },
  },
});

