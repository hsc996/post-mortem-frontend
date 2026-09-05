import { useState } from "react";
import { motion } from "motion/react";
import { useUsers } from "../../hooks/useUsers";
import { useInvites } from "../../hooks/useInvites";
import type { Role } from "../../types/user";
import { feedContainerVariants, feedItemVariants } from "../../lib/motionVariants";
import { InviteUserPanel } from "./InviteUserPanel";

const ROLES: Role[] = ["admin", "responder", "viewer"];

interface AdminUsersScreenProps {
  token: string;
  currentUserId: string;
  onBack: () => void;
}

function inviteStatus(invite: { isAccepted: boolean; isExpired: boolean }): { label: string; className: string } {
  if (invite.isAccepted) return { label: "ACCEPTED", className: "text-nominal" };
  if (invite.isExpired) return { label: "EXPIRED", className: "text-alarm-muted" };
  return { label: "PENDING", className: "text-ink-dim" };
}

export function AdminUsersScreen({ token, currentUserId, onBack }: AdminUsersScreenProps) {
  const { users, loadError, reload, updateRole } = useUsers(token);
  const { invites, sendInvite } = useInvites(token);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [rowError, setRowError] = useState<{ id: string; reason: string } | null>(null);
  const [invitePanelOpen, setInvitePanelOpen] = useState(false);

  const handleRoleChange = async (userId: string, role: Role) => {
    setPendingId(userId);
    setRowError(null);
    const result = await updateRole(userId, role);
    setPendingId(null);
    if (!result.ok) setRowError({ id: userId, reason: result.reason });
  };

  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-50 border-b-4 border-double border-steel bg-paper px-5 py-4 sm:px-8">
        <div className="mx-auto flex max-w-4xl items-end justify-between gap-4">
          <div>
            <p className="font-display text-xl font-extrabold uppercase tracking-wide text-ink sm:text-2xl">
              USER DIRECTORY
            </p>
            <p className="mt-0.5 text-[11px] font-medium tracking-[0.2em] text-ink-dim">ADMIN — ROLE MANAGEMENT</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setInvitePanelOpen(true)}
              className="inline-flex min-h-11 items-center border border-ink px-4 text-xs font-semibold tracking-[0.1em] text-ink transition-colors hover:bg-ink hover:text-paper focus-visible:bg-ink focus-visible:text-paper"
            >
              + INVITE USER
            </button>
            <button
              type="button"
              onClick={onBack}
              className="inline-flex min-h-11 items-center border border-ink px-4 text-xs font-semibold tracking-[0.1em] text-ink transition-colors hover:bg-ink hover:text-paper focus-visible:bg-ink focus-visible:text-paper"
            >
              BACK TO WIRE
            </button>
          </div>
        </div>
      </header>

      <InviteUserPanel isOpen={invitePanelOpen} onClose={() => setInvitePanelOpen(false)} onSend={sendInvite} />

      <main className="mx-auto max-w-4xl px-5 py-6 sm:px-8">
        {loadError && (
          <div className="mb-4 flex items-center justify-between gap-3 border border-alarm-muted px-2.5 py-1.5">
            <p className="text-xs text-alarm-muted">{loadError}</p>
            <button
              type="button"
              onClick={reload}
              className="inline-flex min-h-11 shrink-0 items-center text-xs font-semibold tracking-[0.1em] text-alarm-muted transition-colors hover:text-ink focus-visible:text-ink"
            >
              RETRY
            </button>
          </div>
        )}

        {users === null && !loadError && <p className="text-sm text-ink-dim">LOADING DIRECTORY…</p>}

        {users && users.length === 0 && <p className="text-sm text-ink-dim">No users found.</p>}

        {users && users.length > 0 && (
          <motion.ul initial="hidden" animate="show" variants={feedContainerVariants} className="flex flex-col">
            {users.map((user) => (
              <motion.li
                key={user.id}
                variants={feedItemVariants}
                className="flex flex-col gap-2 border-b border-rule py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-ink">
                    {user.name}
                    {user.id === currentUserId && <span className="ml-2 text-xs text-ink-dim">(you)</span>}
                  </span>
                  <span className="text-xs text-ink-dim">{user.email}</span>
                  {!user.isActive && (
                    <span className="text-xs font-semibold text-alarm-muted">INACTIVE</span>
                  )}
                  {rowError?.id === user.id && (
                    <span className="text-xs text-alarm-muted">{rowError.reason}</span>
                  )}
                </div>

                <div className={`flex border border-rule ${pendingId === user.id ? "opacity-50" : ""}`}>
                  {ROLES.map((role, i) => (
                    <button
                      key={role}
                      type="button"
                      disabled={pendingId === user.id || user.id === currentUserId}
                      onClick={() => void handleRoleChange(user.id, role)}
                      className={`min-h-11 flex-1 px-3 text-xs font-semibold tracking-[0.08em] transition-colors disabled:pointer-events-none ${
                        i > 0 ? "border-l border-rule" : ""
                      } ${
                        user.role === role
                          ? "bg-ink text-paper"
                          : "text-ink-dim hover:text-ink disabled:hover:text-ink-dim"
                      }`}
                    >
                      {role.toUpperCase()}
                    </button>
                  ))}
                </div>
              </motion.li>
            ))}
          </motion.ul>
        )}

        {invites && invites.filter((invite) => !invite.isAccepted).length > 0 && (
          <>
            <p className="mb-3 mt-8 text-xs font-semibold tracking-[0.15em] text-ink-dim">PENDING INVITES</p>
            <motion.ul initial="hidden" animate="show" variants={feedContainerVariants} className="flex flex-col">
              {invites
                .filter((invite) => !invite.isAccepted)
                .map((invite) => {
                  const status = inviteStatus(invite);
                  return (
                    <motion.li
                      key={invite.id}
                      variants={feedItemVariants}
                      className="flex items-center justify-between gap-3 border-b border-rule py-3"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm text-ink">{invite.email}</span>
                        <span className="text-xs text-ink-dim">{invite.role.toUpperCase()}</span>
                      </div>
                      <span className={`text-xs font-semibold tracking-[0.08em] ${status.className}`}>
                        {status.label}
                      </span>
                    </motion.li>
                  );
                })}
            </motion.ul>
          </>
        )}
      </main>
    </div>
  );
}
