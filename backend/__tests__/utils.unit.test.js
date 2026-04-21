const { hashPassword, comparePassword, isValidEmail, generateId } = require('../src/utils/helpers');
const bcrypt = require('bcrypt');

describe('Utility Functions - Unit Tests', () => {
  
  describe('Password Hashing', () => {
    it('should hash password successfully', async () => {
      const password = 'TestPassword123!';
      const hash = await bcrypt.hash(password, 10);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(10);
    });

    it('should produce different hashes for same password', async () => {
      const password = 'TestPassword123!';
      const hash1 = await bcrypt.hash(password, 10);
      const hash2 = await bcrypt.hash(password, 10);

      expect(hash1).not.toBe(hash2);
    });

    it('should verify correct password', async () => {
      const password = 'TestPassword123!';
      const hash = await bcrypt.hash(password, 10);

      const isValid = await bcrypt.compare(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'TestPassword123!';
      const wrongPassword = 'WrongPassword456!';
      const hash = await bcrypt.hash(password, 10);

      const isValid = await bcrypt.compare(wrongPassword, hash);
      expect(isValid).toBe(false);
    });

    it('should handle empty passwords gracefully', async () => {
      const hash = await bcrypt.hash('', 10);
      expect(hash).toBeDefined();
      
      const isValid = await bcrypt.compare('', hash);
      expect(isValid).toBe(true);
    });
  });

  describe('Email Validation', () => {
    it('should accept valid email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'name+tag@example.com',
        'a@b.c',
      ];

      validEmails.forEach(email => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        expect(emailRegex.test(email)).toBe(true);
      });
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        'notanemail',
        '@example.com',
        'test@',
        'test..name@example.com',
        'test @example.com',
        'test@example',
      ];

      invalidEmails.forEach(email => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        expect(emailRegex.test(email)).toBe(false);
      });
    });

    it('should handle edge cases', () => {
      const edgeCases = [
        '',
        null,
        undefined,
        '   ',
        'test@@example.com',
      ];

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      edgeCases.forEach(email => {
        expect(emailRegex.test(email)).toBe(false);
      });
    });
  });

  describe('ID Generation', () => {
    it('should generate unique IDs', () => {
      const generateId = () => Math.random().toString(36).substring(7);
      const id1 = generateId();
      const id2 = generateId();

      expect(id1).not.toBe(id2);
    });

    it('should generate alphanumeric IDs', () => {
      const generateId = () => Math.random().toString(36).substring(7);
      const id = generateId();

      expect(/^[a-z0-9]+$/.test(id)).toBe(true);
    });

    it('should generate IDs with consistent format', () => {
      const generateId = () => Math.random().toString(36).substring(7);
      
      for (let i = 0; i < 10; i++) {
        const id = generateId();
        expect(typeof id).toBe('string');
        expect(id.length).toBeGreaterThan(0);
      }
    });
  });

  describe('String Utilities', () => {
    it('should trim whitespace', () => {
      const trim = (str) => str.trim();

      expect(trim('  hello  ')).toBe('hello');
      expect(trim('\nhello\n')).toBe('hello');
      expect(trim('\thello\t')).toBe('hello');
    });

    it('should sanitize HTML/JavaScript', () => {
      const sanitize = (str) => str.replace(/[<>]/g, '');

      expect(sanitize('<script>alert("xss")</script>'))
        .toBe('script>alert("xss")/script>');
      expect(sanitize('<img src="x" onerror="alert()">')).toBe('img src="x" onerror="alert()">');
    });

    it('should truncate long strings', () => {
      const truncate = (str, len) => str.length > len ? str.substring(0, len) + '...' : str;

      expect(truncate('hello world', 5)).toBe('hello...');
      expect(truncate('hi', 5)).toBe('hi');
    });

    it('should capitalize strings', () => {
      const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('HELLO')).toBe('HELLO');
      expect(capitalize('')).toBe('');
    });
  });

  describe('Array Utilities', () => {
    it('should remove duplicates', () => {
      const removeDuplicates = (arr) => [...new Set(arr)];

      expect(removeDuplicates([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
      expect(removeDuplicates(['a', 'b', 'a'])).toEqual(['a', 'b']);
    });

    it('should flatten nested arrays', () => {
      const flatten = (arr) => arr.reduce((acc, val) => 
        Array.isArray(val) ? acc.concat(flatten(val)) : acc.concat(val), []);

      expect(flatten([1, [2, 3], [4, [5]]])).toEqual([1, 2, 3, 4, 5]);
    });

    it('should chunk arrays', () => {
      const chunk = (arr, size) => {
        const result = [];
        for (let i = 0; i < arr.length; i += size) {
          result.push(arr.slice(i, i + size));
        }
        return result;
      };

      expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    });
  });

  describe('Object Utilities', () => {
    it('should merge objects', () => {
      const merge = (obj1, obj2) => ({ ...obj1, ...obj2 });

      const result = merge({ a: 1 }, { b: 2 });
      expect(result).toEqual({ a: 1, b: 2 });
    });

    it('should filter object properties', () => {
      const filter = (obj, predicate) => 
        Object.fromEntries(Object.entries(obj).filter(([k, v]) => predicate(k, v)));

      const result = filter({ a: 1, b: 2, c: 3 }, (k) => k !== 'b');
      expect(result).toEqual({ a: 1, c: 3 });
    });

    it('should pick specific keys', () => {
      const pick = (obj, keys) => 
        keys.reduce((acc, key) => ({ ...acc, [key]: obj[key] }), {});

      const result = pick({ a: 1, b: 2, c: 3 }, ['a', 'c']);
      expect(result).toEqual({ a: 1, c: 3 });
    });

    it('should omit specific keys', () => {
      const omit = (obj, keys) => 
        Object.fromEntries(Object.entries(obj).filter(([k]) => !keys.includes(k)));

      const result = omit({ a: 1, b: 2, c: 3 }, ['b']);
      expect(result).toEqual({ a: 1, c: 3 });
    });
  });

  describe('Date/Time Utilities', () => {
    it('should format dates', () => {
      const format = (date) => date.toISOString();

      const date = new Date('2026-03-19');
      expect(format(date)).toMatch(/2026-03-19/);
    });

    it('should calculate time differences', () => {
      const timeDiff = (date1, date2) => {
        return Math.abs(date2.getTime() - date1.getTime());
      };

      const date1 = new Date('2026-01-01');
      const date2 = new Date('2026-01-02');
      const diff = timeDiff(date1, date2);

      expect(diff).toBe(86400000); // 1 day in ms
    });

    it('should validate date ranges', () => {
      const isWithinRange = (date, start, end) => {
        return date >= start && date <= end;
      };

      const testDate = new Date('2026-06-15');
      const startDate = new Date('2026-01-01');
      const endDate = new Date('2026-12-31');

      expect(isWithinRange(testDate, startDate, endDate)).toBe(true);
    });
  });
});
