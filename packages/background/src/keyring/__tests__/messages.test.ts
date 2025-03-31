import {
  GetIsLockedMsg,
  GetKeyRingStatusMsg,
  LockKeyRingMsg,
  UnlockKeyRingMsg,
  SelectKeyRingMsg,
  CheckPasswordMsg,
} from "../messages";
import { ROUTE } from "../constants";

describe("Keyring Messages", () => {
  describe("GetIsLockedMsg", () => {
    it("should have the correct type", () => {
      expect(GetIsLockedMsg.type()).toBe("GetIsLockedMsg");
    });

    it("should have the correct route", () => {
      const msg = new GetIsLockedMsg();
      expect(msg.route()).toBe(ROUTE);
    });

    it("should allow external approval", () => {
      const msg = new GetIsLockedMsg();
      expect(msg.approveExternal()).toBe(true);
    });
  });

  describe("GetKeyRingStatusMsg", () => {
    it("should have the correct type", () => {
      expect(GetKeyRingStatusMsg.type()).toBe("get-keyring-status");
    });

    it("should have the correct route", () => {
      const msg = new GetKeyRingStatusMsg();
      expect(msg.route()).toBe(ROUTE);
    });
  });

  describe("LockKeyRingMsg", () => {
    it("should have the correct type", () => {
      expect(LockKeyRingMsg.type()).toBe("lock-keyring");
    });

    it("should have the correct route", () => {
      const msg = new LockKeyRingMsg();
      expect(msg.route()).toBe(ROUTE);
    });
  });

  describe("UnlockKeyRingMsg", () => {
    it("should have the correct type", () => {
      expect(UnlockKeyRingMsg.type()).toBe("unlock-keyring");
    });

    it("should have the correct route", () => {
      const msg = new UnlockKeyRingMsg("password");
      expect(msg.route()).toBe(ROUTE);
    });

    it("should validate password", () => {
      const msg = new UnlockKeyRingMsg("password");
      expect(() => msg.validateBasic()).not.toThrow();

      const emptyMsg = new UnlockKeyRingMsg("");
      expect(() => emptyMsg.validateBasic()).toThrow();
    });
  });

  describe("SelectKeyRingMsg", () => {
    it("should have the correct type", () => {
      expect(SelectKeyRingMsg.type()).toBe("select-keyring");
    });

    it("should have the correct route", () => {
      const msg = new SelectKeyRingMsg("vault-id");
      expect(msg.route()).toBe(ROUTE);
    });

    it("should validate vault id", () => {
      const msg = new SelectKeyRingMsg("vault-id");
      expect(() => msg.validateBasic()).not.toThrow();

      const emptyMsg = new SelectKeyRingMsg("");
      expect(() => emptyMsg.validateBasic()).toThrow();
    });
  });

  describe("CheckPasswordMsg", () => {
    it("should have the correct type", () => {
      expect(CheckPasswordMsg.type()).toBe("check-keyring-password");
    });

    it("should have the correct route", () => {
      const msg = new CheckPasswordMsg("password");
      expect(msg.route()).toBe(ROUTE);
    });

    it("should validate password", () => {
      const msg = new CheckPasswordMsg("password");
      expect(() => msg.validateBasic()).not.toThrow();

      const emptyMsg = new CheckPasswordMsg("");
      expect(() => emptyMsg.validateBasic()).toThrow();
    });
  });
});
