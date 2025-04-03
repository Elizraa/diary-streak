import {
  storeStampData,
  getStampData,
  clearStampData,
  isStampDataValid,
} from '../../src/utils/stampStore';

describe('stampStore', () => {
  const testData = { id: 1, name: 'Test Stamp' };

  afterEach(() => {
    sessionStorage.clear();
    jest.clearAllMocks();
  });

  describe('storeStampData', () => {
    it('should store data in sessionStorage', () => {
      storeStampData(testData);

      const storedData = sessionStorage.getItem('dailyStampData');
      expect(storedData).not.toBeNull();
      expect(JSON.parse(storedData)).toEqual(testData);
    });

    it('should not throw error when window is undefined', () => {
      const originalWindow = global.window;
      delete global.window;

      expect(() => storeStampData(testData)).not.toThrow();
      global.window = originalWindow;
    });
  });

  describe('getStampData', () => {
    it('should return daily stamp data when data exist', () => {
      sessionStorage.setItem('dailyStampData', JSON.stringify(testData));

      const storedData = getStampData();

      expect(storedData).toEqual(testData);
    });

    it('should return null when data not exist', () => {
      const storedData = getStampData();

      expect(storedData).toBeNull();
    });

    it('should return null when window undefined', () => {
      const originalWindow = global.window;
      delete global.window;

      const storedData = getStampData();

      expect(storedData).toBeNull();
      global.window = originalWindow;
    });
  });

  describe('isStampDataValid', () => {
    it('should returns false if data is older than 5 minutes', () => {
      const oldData = {
        username: 'testUser',
        stamp: 1,
        timestamp: Date.now() - 6 * 60 * 1000, // 6 minutes ago
        mood: 'neutral',
      };
      sessionStorage.setItem('dailyStampData', JSON.stringify(oldData));
      const result = isStampDataValid();

      expect(result).toBe(false);
    });

    it('should returns true if data is within the last 5 minutes', () => {
      const recentData = {
        username: 'testUser',
        stamp: 1,
        timestamp: Date.now() - 2 * 60 * 1000, // 2 minutes ago
        mood: 'excited',
      };
      sessionStorage.setItem('dailyStampData', JSON.stringify(recentData));
      const result = isStampDataValid();

      expect(result).toBe(true);
    });
  });
});
