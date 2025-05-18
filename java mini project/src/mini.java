package bank.management.system;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.sql.ResultSet;

public class mini extends JFrame implements ActionListener {
    String pin;
    JButton button;

    mini(String pin) {
        this.pin = pin;
        getContentPane().setBackground(new Color(255, 204, 204));
        setSize(400, 600);
        setLocation(20, 20);
        setUndecorated(true);
        setLayout(null);

        JLabel label1 = new JLabel();
        label1.setBounds(20, 140, 360, 200);
        add(label1);

        JLabel label2 = new JLabel("ABC Bank");
        label2.setFont(new Font("System", Font.BOLD, 15));
        label2.setBounds(150, 20, 200, 20);
        add(label2);

        JLabel label3 = new JLabel();
        label3.setBounds(20, 80, 300, 20);
        add(label3);

        JLabel label4 = new JLabel();
        label4.setBounds(20, 400, 300, 20);
        add(label4);

        Con c = new Con(); // Consolidated connection

        try {
            ResultSet resultSet = c.statement.executeQuery("select * from login where pin = '" + pin + "'");
            if (resultSet.next()) {
                label3.setText("Card Number:  " + resultSet.getString("card_number").substring(0, 4) + "XXXXXXXX" + resultSet.getString("card_number").substring(12));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        try {
            int balance = 0;
            ResultSet resultSet = c.statement.executeQuery("Select * from bank where pin = '" + pin + "'");
            StringBuilder transactions = new StringBuilder("<html>");
            while (resultSet.next()) {
                transactions.append(resultSet.getString("date")).append("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;")
                        .append(resultSet.getString("type")).append("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;")
                        .append(resultSet.getString("amount")).append("<br><br>");
                if (resultSet.getString("type").equals("Deposit")) {
                    balance += Integer.parseInt(resultSet.getString("amount"));
                } else {
                    balance -= Integer.parseInt(resultSet.getString("amount"));
                }
            }
            transactions.append("</html>");
            label1.setText(transactions.toString());
            label4.setText("Your Total Balance is Rs " + balance);
        } catch (Exception e) {
            e.printStackTrace();
        }

        button = new JButton("Exit");
        button.setBounds(20, 500, 100, 25);
        button.addActionListener(this);
        add(button);

        setVisible(true);
    }

    @Override
    public void actionPerformed(ActionEvent e) {
        setVisible(false);
    }

    public static void main(String[] args) {
        new mini("");
    }
}
