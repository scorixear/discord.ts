import 'jest';

import { Logger } from '../../../../src/logging/logger';
import { TestStringSelectMenuInteractionModel } from '../../../helpers/SelectMenuInteractionModels/TestStringSelectMenuInteractionModel';

jest.mock('../../../../src/logging/logger');

let throwMockError = false;
const mockInteraction = {
  replied: false,
  deferred: false,
  deferReply: jest.fn().mockImplementation(() => {
    if (throwMockError) {
      return new Promise((_, reject) => reject());
    }
    return new Promise((resolve) => resolve(0));
  }),
  isStringSelectMenu: jest.fn().mockReturnValue(true),
  isSelectMenu: jest.fn().mockReturnValue(true)
};

const flushPromises = () => new Promise((resolve) => Promise.resolve().then(resolve));

describe('StringSelectMenuInteractionModel', () => {
  let SuT: TestStringSelectMenuInteractionModel;
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    SuT = new TestStringSelectMenuInteractionModel('test', 1000, true);
    throwMockError = false;
    mockInteraction.replied = false;
    mockInteraction.deferred = false;
    mockInteraction.isStringSelectMenu = jest.fn().mockReturnValue(true);
    mockInteraction.isSelectMenu = jest.fn().mockReturnValue(true);
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('constructor', () => {
    it('should set the id, deferReply and deferReplyEphemeral', () => {
      expect(SuT.constructorCalled).toBeTruthy();
      expect((SuT as any).id).toBe('test');
      expect((SuT as any).deferReply).toBe(1000);
      expect((SuT as any).deferReplyEphemeral).toBeTruthy();
    });
  });

  describe('activateDeferredReply', () => {
    it('should not call if deferReply is undefined', async () => {
      SuT = new TestStringSelectMenuInteractionModel('test', undefined, true);
      await SuT.activateDeferredReply(mockInteraction as any);
      jest.advanceTimersByTime(1000);
      await flushPromises();
      expect(mockInteraction.deferReply).not.toHaveBeenCalled();
      expect(Logger.exception).not.toHaveBeenCalled();
    });

    it('should call deferReply if deferReply is defined', async () => {
      await SuT.activateDeferredReply(mockInteraction as any);
      jest.advanceTimersByTime(1000);
      await flushPromises();
      expect(mockInteraction.deferReply).toHaveBeenCalledWith({ ephemeral: true });
      expect(Logger.exception).not.toHaveBeenCalled();
    });

    it('should not call deferReply if interation was replied and deferred', async () => {
      mockInteraction.replied = true;
      mockInteraction.deferred = true;
      await SuT.activateDeferredReply(mockInteraction as any);
      jest.advanceTimersByTime(1000);
      await flushPromises();
      expect(mockInteraction.deferReply).not.toHaveBeenCalled();
      expect(Logger.exception).not.toHaveBeenCalled();
    });

    it('should call logger if deferReply is defined and error occurs', async () => {
      throwMockError = true;
      await SuT.activateDeferredReply(mockInteraction as any);
      jest.advanceTimersByTime(1000);
      await flushPromises();
      expect(mockInteraction.deferReply).toHaveBeenCalledWith({ ephemeral: true });
      expect(Logger.exception).toHaveBeenCalled();
    });
  });

  describe('canHandle', () => {
    it('should return true if command is the same and interaction is a correct interaction', () => {
      expect(SuT.canHandle(SuT.id, mockInteraction as any)).toBeTruthy();
    });

    it('should return false if command is not the same', () => {
      expect(SuT.canHandle('notTest', mockInteraction as any)).toBeFalsy();
    });

    it('should return false if interaction is not a correct interaction', () => {
      mockInteraction.isStringSelectMenu = jest.fn().mockReturnValue(false);
      mockInteraction.isSelectMenu = jest.fn().mockReturnValue(false);
      expect(SuT.canHandle(SuT.id, mockInteraction as any)).toBeFalsy();
    });

    it('should return true if interaction is only string select menu', () => {
      mockInteraction.isSelectMenu = jest.fn().mockReturnValue(false);
      expect(SuT.canHandle(SuT.id, mockInteraction as any)).toBeTruthy();
    });

    it('should return true if interaction is only select menu', () => {
      mockInteraction.isStringSelectMenu = jest.fn().mockReturnValue(false);
      expect(SuT.canHandle(SuT.id, mockInteraction as any)).toBeTruthy();
    });
  });
});
