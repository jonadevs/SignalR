using Microsoft.AspNetCore.SignalR;
using SignalR.Models;

namespace SignalR.Hubs
{
    public class TrackHub : Hub
    {
        public async Task SendPosition(Position position)
        {
            await Clients.All.SendAsync("positionUpdated", position);
        }
    }
}
