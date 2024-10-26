<template>
  <div class="container">
    <h2 class="title">Medical Record Manager</h2>
    
    <form @submit.prevent="uploadData" class="form">
      <div class="form-group">
        <label for="uid" class="form-label">Unique ID (UID)</label>
        <input
          type="text"
          id="uid"
          class="form-control"
          v-model="uid"
          placeholder="Enter Epipen UID"
          required
        />
      </div>

      <div class="form-group">
        <label for="file" class="form-label">Upload Medical File</label>
        <input
          type="file"
          class="form-control"
          @change="handleFileChange"
          required
        />
      </div>

      <div class="form-group">
        <label for="contactName" class="form-label">Contact Name</label>
        <input
          type="text"
          id="contactName"
          class="form-control"
          v-model="contactName"
          placeholder="Enter Contact Name"
          required
        />
      </div>

      <button type="submit" class="btn btn-submit">Upload Data</button>
    </form>

    <div class="records-section">
      <button @click="fetchData" class="btn btn-fetch">Fetch Records by UID</button>

      <div class="record-list">
        <h3 class="sub-title">Records & Contacts</h3>
        <div v-if="fetchedData.length > 0">
          <ul class="list">
            <li v-for="(item, index) in fetchedData" :key="index" class="list-item">
              <span>{{ item.name || 'File' }}</span>
              <a v-if="item.url" :href="item.url" target="_blank" class="link">View File</a>
              <button @click="deleteItem(item)" class="btn btn-delete">Delete</button>
            </li>
          </ul>
        </div>
        <p v-else class="no-records">No records found for this UID</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { db, storage } from './firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const uid = ref('');
const file = ref(null);
const contactName = ref('');
const fetchedData = ref([]);

function handleFileChange(event) {
  file.value = event.target.files[0];
}

async function uploadData() {
  if (!uid.value) {
    alert("Please enter a UID.");
    return;
  }

  try {
    let fileUrl = "";
    if (file.value) {
      const storageReference = storageRef(storage, `userFiles/${uid.value}/${file.value.name}`);
      const snapshot = await uploadBytes(storageReference, file.value);
      fileUrl = await getDownloadURL(snapshot.ref);
    }

    const docRef = doc(db, "userData", uid.value);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      await updateDoc(docRef, {
        files: fileUrl ? [...docSnap.data().files || [], fileUrl] : docSnap.data().files,
        contacts: [{ name: contactName.value }, ...docSnap.data().contacts || []],
      });
    } else {
      await setDoc(docRef, {
        files: fileUrl ? [fileUrl] : [],
        contacts: [{ name: contactName.value }],
      });
    }

    alert("Data uploaded successfully!");
    contactName.value = "";
    file.value = null;
  } catch (error) {
    console.error("Error uploading data:", error);
    alert("Failed to upload data.");
  }
}

async function fetchData() {
  if (!uid.value) {
    alert("Please enter a UID to fetch data.");
    return;
  }

  try {
    const docRef = doc(db, "userData", uid.value);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      fetchedData.value = [
        ...data.contacts,
        ...data.files.map((url) => ({ name: "File", url: url })),
      ];
    } else {
      fetchedData.value = [];
      alert("No data found for this UID.");
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    alert("Failed to fetch data.");
  }
}

async function deleteItem(item) {
  if (item.url) {
    const storageReference = storageRef(storage, item.url);
    try {
      await deleteObject(storageReference);
      alert("File deleted successfully!");
      fetchData();
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("Failed to delete file.");
    }
  } else {
    const docRef = doc(db, "userData", uid.value);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const updatedContacts = docSnap.data().contacts.filter(contact => 
        contact.name !== item.name
      );

      await updateDoc(docRef, { contacts: updatedContacts });
      alert("Contact deleted successfully!");
      fetchData();
    }
  }
}
</script>

<style scoped>
.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.title {
  text-align: center;
  font-size: 2em;
  margin-bottom: 20px;
  font-weight: bold;
}

.form {
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1em;
}

.btn {
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 1em;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn:hover {
  background-color: #0056b3;
}

.btn-fetch {
  background-color: #28a745;
}

.btn-fetch:hover {
  background-color: #218838;
}

.records-section {
  text-align: center;
}

.sub-title {
  font-size: 1.5em;
  margin-bottom: 15px;
  font-weight: bold;
}

.list {
  list-style: none;
  padding: 0;
}

.list-item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
  margin-bottom: 10px;
}

.link {
  color: #007bff;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}

.no-records {
  color: #999;
}

.btn-delete {
  color: #dc3545;
  border: none;
  background: none;
  cursor: pointer;
}

.btn-delete:hover {
  color: #c82333;
}
</style>
