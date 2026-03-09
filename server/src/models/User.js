/**
 * Modèle Utilisateur
 * User Model - Gestion des utilisateurs de l'application
 *
 * @module models/User
 * @author Renault Group - Service 00596
 */

const { getDatabase } = require('../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Rôles disponibles / Available roles
const ROLES = {
  ADMIN: 'admin',           // Administrateur - tous les droits
  USER: 'user',             // Utilisateur standard - créer/modifier ses fiches
  READONLY: 'readonly'      // Lecture seule - consultation uniquement
};

/**
 * Classe User - Gestion des utilisateurs
 */
class User {
  /**
   * Crée un nouvel utilisateur
   * Create a new user
   *
   * @param {Object} userData - Données de l'utilisateur
   * @returns {Object} Utilisateur créé
   */
  static create(userData) {
    const db = getDatabase();
    const id = uuidv4();
    const hashedPassword = bcrypt.hashSync(userData.password, 10);
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO users (id, matricule, email, password_hash, nom, prenom, role, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      userData.matricule,
      userData.email,
      hashedPassword,
      userData.nom,
      userData.prenom,
      userData.role || ROLES.USER,
      now,
      now
    );

    return this.findById(id);
  }

  /**
   * Trouve un utilisateur par ID
   * Find user by ID
   *
   * @param {string} id - ID de l'utilisateur
   * @returns {Object|null} Utilisateur trouvé ou null
   */
  static findById(id) {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT id, matricule, email, nom, prenom, role, created_at, updated_at, last_login
      FROM users WHERE id = ?
    `);
    return stmt.get(id);
  }

  /**
   * Trouve un utilisateur par matricule
   * Find user by matricule
   *
   * @param {string} matricule - Matricule de l'utilisateur
   * @returns {Object|null} Utilisateur trouvé ou null
   */
  static findByMatricule(matricule) {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT * FROM users WHERE matricule = ?
    `);
    return stmt.get(matricule);
  }

  /**
   * Trouve un utilisateur par email
   * Find user by email
   *
   * @param {string} email - Email de l'utilisateur
   * @returns {Object|null} Utilisateur trouvé ou null
   */
  static findByEmail(email) {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT * FROM users WHERE email = ?
    `);
    return stmt.get(email);
  }

  /**
   * Vérifie le mot de passe d'un utilisateur
   * Verify user password
   *
   * @param {string} password - Mot de passe à vérifier
   * @param {string} hashedPassword - Hash stocké
   * @returns {boolean} Mot de passe valide ou non
   */
  static verifyPassword(password, hashedPassword) {
    return bcrypt.compareSync(password, hashedPassword);
  }

  /**
   * Met à jour la date de dernière connexion
   * Update last login date
   *
   * @param {string} id - ID de l'utilisateur
   */
  static updateLastLogin(id) {
    const db = getDatabase();
    const stmt = db.prepare(`
      UPDATE users SET last_login = ? WHERE id = ?
    `);
    stmt.run(new Date().toISOString(), id);
  }

  /**
   * Liste tous les utilisateurs
   * List all users
   *
   * @returns {Array} Liste des utilisateurs
   */
  static findAll() {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT id, matricule, email, nom, prenom, role, created_at, last_login
      FROM users ORDER BY nom, prenom
    `);
    return stmt.all();
  }

  /**
   * Met à jour un utilisateur
   * Update user
   *
   * @param {string} id - ID de l'utilisateur
   * @param {Object} userData - Données à mettre à jour
   * @returns {Object} Utilisateur mis à jour
   */
  static update(id, userData) {
    const db = getDatabase();
    const updates = [];
    const values = [];

    if (userData.nom) {
      updates.push('nom = ?');
      values.push(userData.nom);
    }
    if (userData.prenom) {
      updates.push('prenom = ?');
      values.push(userData.prenom);
    }
    if (userData.email) {
      updates.push('email = ?');
      values.push(userData.email);
    }
    if (userData.role) {
      updates.push('role = ?');
      values.push(userData.role);
    }
    if (userData.password) {
      updates.push('password_hash = ?');
      values.push(bcrypt.hashSync(userData.password, 10));
    }

    updates.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);

    const stmt = db.prepare(`
      UPDATE users SET ${updates.join(', ')} WHERE id = ?
    `);
    stmt.run(...values);

    return this.findById(id);
  }

  /**
   * Supprime un utilisateur
   * Delete user
   *
   * @param {string} id - ID de l'utilisateur
   * @returns {boolean} Succès de la suppression
   */
  static delete(id) {
    const db = getDatabase();
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
}

module.exports = { User, ROLES };
