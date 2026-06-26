namespace Backend.Services;

using System.Collections.Concurrent;

public class TokenListService : ITokenListService
{
    // jti -> data de expiração natural do token (para limpeza)
    private readonly ConcurrentDictionary<string, DateTimeOffset> _whitelist = new();
    private readonly ConcurrentDictionary<string, DateTimeOffset> _blacklist = new();
    private DateTimeOffset _nextCleanup = DateTimeOffset.UtcNow.AddMinutes(10);

    public void Whitelist(string jti, DateTimeOffset expiresAt)
    {
        if (string.IsNullOrWhiteSpace(jti)) return;
        _whitelist[jti] = expiresAt;
        _blacklist.TryRemove(jti, out _);
        TryCleanup();
    }

    public void Revoke(string jti)
    {
        if (string.IsNullOrWhiteSpace(jti)) return;
        if (_whitelist.TryRemove(jti, out var expiresAt))
            _blacklist[jti] = expiresAt;
        else
            _blacklist[jti] = DateTimeOffset.UtcNow.AddHours(8);
        TryCleanup();
    }

    public bool IsAllowed(string jti)
    {
        if (string.IsNullOrWhiteSpace(jti)) return false;
        if (_blacklist.ContainsKey(jti)) return false;
        return _whitelist.ContainsKey(jti);
    }

    private void TryCleanup()
    {
        if (DateTimeOffset.UtcNow < _nextCleanup) return;
        _nextCleanup = DateTimeOffset.UtcNow.AddMinutes(10);

        var now = DateTimeOffset.UtcNow;
        foreach (var kv in _whitelist)
            if (kv.Value < now) _whitelist.TryRemove(kv.Key, out _);
        foreach (var kv in _blacklist)
            if (kv.Value < now) _blacklist.TryRemove(kv.Key, out _);
    }
}
