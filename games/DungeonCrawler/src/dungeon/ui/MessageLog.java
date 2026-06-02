package dungeon.ui;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;

public class MessageLog {
    private static final int MAX = 60;
    private final Deque<String> messages = new ArrayDeque<>();

    public void add(String msg) {
        messages.addFirst(msg);
        if (messages.size() > MAX) messages.removeLast();
    }

    public void addAll(List<String> msgs) { msgs.forEach(this::add); }

    /** Returns the N most recent messages (newest first) */
    public List<String> recent(int n) {
        List<String> out = new ArrayList<>();
        int i = 0;
        for (String m : messages) {
            if (i++ >= n) break;
            out.add(m);
        }
        return out;
    }
}
